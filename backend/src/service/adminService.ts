import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { isUuid } from "../utils/isUuid";
import { createNotification } from "./notificationService";
import { paginate, type Pagination } from "./problemService";
import type { Prisma } from "../../generated/prisma/client";
import type {
  JobStatus,
  ProposalStatus,
  Role,
  UserStatus,
} from "../../generated/prisma/enums";

const PAISE_PER_RUPEE = 100;

const ACTIVE_JOB_STATUSES: JobStatus[] = [
  "SCHEDULED",
  "ON_THE_WAY",
  "ARRIVED",
  "INSPECTION",
  "IN_PROGRESS",
];

const OPEN_PROBLEM_STATUSES = ["OPEN", "MATCHING", "PROPOSALS_RECEIVED"] as const;

// ---------------------------------------------------------------------------
// Platform metrics
// ---------------------------------------------------------------------------

export interface PlatformStats {
  users: {
    total: number;
    customers: number;
    professionals: number;
    admins: number;
    suspendedOrBanned: number;
  };
  problems: {
    total: number;
    open: number;
    awarded: number;
    cancelledOrExpired: number;
  };
  proposals: {
    total: number;
    submitted: number;
    accepted: number;
    withdrawn: number;
  };
  jobs: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    grossRupees: number;
    confirmedJobs: number;
  };
  pendingVerifications: number;
  openDisputes: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [
    usersByRole,
    inactiveUsers,
    problemsByStatus,
    proposalsByStatus,
    jobsByStatus,
    confirmedAggregate,
    pendingVerifications,
    openDisputes,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], where: { deletedAt: null }, _count: true }),
    prisma.user.count({
      where: { deletedAt: null, status: { in: ["SUSPENDED", "BANNED"] } },
    }),
    prisma.problem.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    prisma.proposal.groupBy({ by: ["status"], _count: true }),
    prisma.job.groupBy({ by: ["status"], _count: true }),
    prisma.job.aggregate({
      where: { status: { in: ["CUSTOMER_CONFIRMED", "CLOSED"] } },
      _sum: { currentAmount: true },
      _count: true,
    }),
    prisma.verificationRequest.count({ where: { status: "PENDING" } }),
    prisma.dispute.count({ where: { status: "OPEN" } }),
  ]);

  const userCount = (role: Role) =>
    usersByRole
      .filter((row) => row.role === role)
      .reduce((total, row) => total + row._count, 0);

  const problemCount = (statuses: readonly string[]) =>
    problemsByStatus
      .filter((row) => statuses.includes(row.status))
      .reduce((total, row) => total + row._count, 0);

  const proposalCount = (status: ProposalStatus) =>
    proposalsByStatus
      .filter((row) => row.status === status)
      .reduce((total, row) => total + row._count, 0);

  const jobCount = (statuses: readonly JobStatus[]) =>
    jobsByStatus
      .filter((row) => statuses.includes(row.status))
      .reduce((total, row) => total + row._count, 0);

  return {
    users: {
      total: usersByRole.reduce((total, row) => total + row._count, 0),
      customers: userCount("CUSTOMER"),
      professionals: userCount("PROFESSIONAL"),
      admins: userCount("ADMIN"),
      suspendedOrBanned: inactiveUsers,
    },
    problems: {
      total: problemsByStatus.reduce((total, row) => total + row._count, 0),
      open: problemCount(OPEN_PROBLEM_STATUSES),
      awarded: problemCount(["PROFESSIONAL_SELECTED"]),
      cancelledOrExpired: problemCount(["CANCELLED", "EXPIRED"]),
    },
    proposals: {
      total: proposalsByStatus.reduce((total, row) => total + row._count, 0),
      submitted: proposalCount("SUBMITTED"),
      accepted: proposalCount("ACCEPTED"),
      withdrawn: proposalCount("WITHDRAWN"),
    },
    jobs: {
      total: jobsByStatus.reduce((total, row) => total + row._count, 0),
      active: jobCount(ACTIVE_JOB_STATUSES),
      completed: jobCount(["CUSTOMER_CONFIRMED", "CLOSED"]),
      cancelled: jobCount(["CANCELLED", "REFUNDED"]),
    },
    revenue: {
      grossRupees: (confirmedAggregate._sum.currentAmount ?? 0) / PAISE_PER_RUPEE,
      confirmedJobs: confirmedAggregate._count,
    },
    pendingVerifications,
    openDisputes,
  };
}

// ---------------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------------

export interface SerializedAdminUser {
  id: string;
  role: Role;
  name: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profileImage: string | null;
  status: UserStatus;
  createdAt: string;
  professional: {
    id: string;
    businessName: string | null;
    verificationStatus: string;
    averageRating: number;
    totalJobs: number;
    experienceYears: number;
  } | null;
}

type AdminUserRow = Prisma.UserGetPayload<{
  include: { professionalProfile: true };
}>;

function serializeAdminUser(user: AdminUserRow): SerializedAdminUser {
  return {
    id: user.id,
    role: user.role,
    name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    profileImage: user.profileImage,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    professional: user.professionalProfile
      ? {
          id: user.professionalProfile.id,
          businessName: user.professionalProfile.businessName,
          verificationStatus: user.professionalProfile.verificationStatus,
          averageRating: Number(user.professionalProfile.averageRating),
          totalJobs: user.professionalProfile.totalJobs,
          experienceYears: user.professionalProfile.experienceYears,
        }
      : null,
  };
}

export interface AdminUserListQuery {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page: number;
  pageSize: number;
}

export async function listUsersForAdmin(
  query: AdminUserListQuery,
): Promise<{ users: SerializedAdminUser[]; pagination: Pagination }> {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    role:
      query.role && query.role !== "ADMIN"
        ? query.role
        : { not: "ADMIN" },
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { firstName: { contains: query.search, mode: "insensitive" } },
            { lastName: { contains: query.search, mode: "insensitive" } },
            { phone: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { professionalProfile: true },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map(serializeAdminUser),
    pagination: paginate(query.page, query.pageSize, total),
  };
}

export async function updateUserStatus(
  userId: string,
  adminId: string,
  input: { status: UserStatus; reason?: string },
): Promise<SerializedAdminUser> {
  if (!isUuid(userId)) {
    throw ApiError.badRequest("userId must be a valid UUID");
  }
  if (userId === adminId) {
    throw ApiError.badRequest("You cannot change your own account status");
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    include: { professionalProfile: true },
  });

  if (!target || target.deletedAt) {
    throw ApiError.notFound("User not found");
  }
  if (target.role === "ADMIN") {
    throw ApiError.forbidden("Administrator accounts cannot be modified here");
  }
  if (target.status === input.status) {
    throw ApiError.conflict(`User is already ${input.status.toLowerCase()}`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { status: input.status },
      include: { professionalProfile: true },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "USER_STATUS_CHANGED",
        entityType: "User",
        entityId: userId,
        metadata: { from: target.status, to: input.status, reason: input.reason ?? null },
      },
    });

    return user;
  });

  await createNotification({
    userId,
    type: "SYSTEM",
    title: `Account ${input.status.toLowerCase()}`,
    message:
      input.status === "ACTIVE"
        ? "Your account has been reactivated by SolveBridge support."
        : `Your account has been ${input.status.toLowerCase()}.${
            input.reason ? ` Reason: ${input.reason}` : ""
          }`,
  });

  return serializeAdminUser(updated);
}

// ---------------------------------------------------------------------------
// Professional verification queue
// ---------------------------------------------------------------------------

export interface SerializedVerificationRequest {
  id: string;
  documentType: string;
  documentUrl: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

export interface SerializedVerification {
  professionalId: string;
  userId: string;
  professionalName: string;
  businessName: string | null;
  verificationStatus: string;
  experienceYears: number;
  skills: string[];
  requests: SerializedVerificationRequest[];
  requestedAt: string | null;
}

type VerificationRow = Prisma.ProfessionalProfileGetPayload<{
  include: {
    user: true;
    skills: { include: { skill: true } };
    verificationRequests: true;
  };
}>;

function serializeVerification(profile: VerificationRow): SerializedVerification {
  const requests = profile.verificationRequests
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    professionalId: profile.id,
    userId: profile.userId,
    professionalName: [profile.user.firstName, profile.user.lastName]
      .filter(Boolean)
      .join(" "),
    businessName: profile.businessName,
    verificationStatus: profile.verificationStatus,
    experienceYears: profile.experienceYears,
    skills: profile.skills.map((entry) => entry.skill.name),
    requests: requests.map((request) => ({
      id: request.id,
      documentType: request.documentType,
      documentUrl: request.documentUrl,
      status: request.status,
      adminNotes: request.adminNotes,
      createdAt: request.createdAt.toISOString(),
    })),
    requestedAt: requests[0]?.createdAt.toISOString() ?? null,
  };
}

const verificationInclude = {
  user: true,
  skills: { include: { skill: true } },
  verificationRequests: { orderBy: { createdAt: "desc" } },
} as const;

export interface AdminVerificationQuery {
  status?: "PENDING" | "VERIFIED" | "REJECTED" | "UNVERIFIED" | "SUSPENDED";
  page: number;
  pageSize: number;
}

export async function listVerificationsForAdmin(
  query: AdminVerificationQuery,
): Promise<{ verifications: SerializedVerification[]; pagination: Pagination }> {
  const where: Prisma.ProfessionalProfileWhereInput = query.status
    ? { verificationStatus: query.status }
    : {};

  const [profiles, total] = await prisma.$transaction([
    prisma.professionalProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: verificationInclude,
    }),
    prisma.professionalProfile.count({ where }),
  ]);

  return {
    verifications: profiles.map(serializeVerification),
    pagination: paginate(query.page, query.pageSize, total),
  };
}

export type VerificationDecision = "APPROVE" | "REJECT" | "REQUEST_INFO";

export async function decideVerification(
  professionalId: string,
  adminId: string,
  input: { decision: VerificationDecision; notes?: string },
): Promise<SerializedVerification> {
  if (!isUuid(professionalId)) {
    throw ApiError.badRequest("professionalId must be a valid UUID");
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { id: professionalId },
    include: verificationInclude,
  });

  if (!profile) {
    throw ApiError.notFound("Professional profile not found");
  }

  const nextStatus =
    input.decision === "APPROVE"
      ? "VERIFIED"
      : input.decision === "REJECT"
        ? "REJECTED"
        : "PENDING";

  const requestStatus =
    input.decision === "APPROVE"
      ? "APPROVED"
      : input.decision === "REJECT"
        ? "REJECTED"
        : "MORE_INFO_REQUIRED";

  const updated = await prisma.$transaction(async (tx) => {
    await tx.professionalProfile.update({
      where: { id: professionalId },
      data: { verificationStatus: nextStatus },
    });

    await tx.verificationRequest.updateMany({
      where: { professionalId, status: "PENDING" },
      data: {
        status: requestStatus,
        adminNotes: input.notes ?? null,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });

    const result = await tx.professionalProfile.findUniqueOrThrow({
      where: { id: professionalId },
      include: verificationInclude,
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: `VERIFICATION_${input.decision}`,
        entityType: "ProfessionalProfile",
        entityId: professionalId,
        metadata: { status: nextStatus, notes: input.notes ?? null },
      },
    });

    return result;
  });

  const messages: Record<VerificationDecision, { title: string; body: string }> = {
    APPROVE: {
      title: "Verification approved",
      body: "Your professional profile is now verified. Verified professionals appear higher in customer matches.",
    },
    REJECT: {
      title: "Verification rejected",
      body: input.notes
        ? `Your verification was rejected: ${input.notes}`
        : "Your verification was rejected. Please review your documents and submit again.",
    },
    REQUEST_INFO: {
      title: "More information required",
      body: input.notes
        ? `We need more information to verify your profile: ${input.notes}`
        : "We need more information to verify your profile. Please update your documents.",
    },
  };

  await createNotification({
    userId: profile.userId,
    type: "VERIFICATION_UPDATE",
    title: messages[input.decision].title,
    message: messages[input.decision].body,
  });

  return serializeVerification(updated);
}

// ---------------------------------------------------------------------------
// Audit trail
// ---------------------------------------------------------------------------

export interface SerializedAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  actorName: string;
  metadata: unknown;
  createdAt: string;
}

export async function listAuditLogs(query: {
  entityType?: string;
  page: number;
  pageSize: number;
}): Promise<{ logs: SerializedAuditLog[]; pagination: Pagination }> {
  const where: Prisma.AuditLogWhereInput = query.entityType
    ? { entityType: query.entityType }
    : {};

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { actor: { select: { firstName: true, lastName: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      actorId: log.actorId,
      actorName: log.actor
        ? [log.actor.firstName, log.actor.lastName].filter(Boolean).join(" ") || "Administrator"
        : "System",
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: paginate(query.page, query.pageSize, total),
  };
}


// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface SerializedCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  problemsCount: number;
}

function serializeCategory(
  category: Prisma.ServiceCategoryGetPayload<{ include: { _count: { select: { problems: true } } } }>,
): SerializedCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    problemsCount: category._count.problems,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

const categoryInclude = { _count: { select: { problems: true } } } as const;

export async function listCategoriesForAdmin(): Promise<SerializedCategory[]> {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { name: "asc" },
    include: categoryInclude,
  });

  return categories.map(serializeCategory);
}

export async function createCategory(
  adminId: string,
  input: { name: string; slug?: string; description?: string },
): Promise<SerializedCategory> {
  const slug = input.slug?.trim() || slugify(input.name);
  if (!slug) {
    throw ApiError.badRequest("A valid slug could not be derived from the name");
  }

  const existing = await prisma.serviceCategory.findFirst({
    where: { OR: [{ name: input.name }, { slug }] },
    select: { id: true },
  });
  if (existing) {
    throw ApiError.conflict("A category with that name or slug already exists");
  }

  const category = await prisma.$transaction(async (tx) => {
    const created = await tx.serviceCategory.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
      },
      include: categoryInclude,
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "CATEGORY_CREATED",
        entityType: "ServiceCategory",
        entityId: created.id,
        metadata: { name: created.name, slug: created.slug },
      },
    });

    return created;
  });

  return serializeCategory(category);
}

export async function updateCategory(
  categoryId: string,
  adminId: string,
  input: { name?: string; slug?: string; description?: string | null; isActive?: boolean },
): Promise<SerializedCategory> {
  if (!isUuid(categoryId)) {
    throw ApiError.badRequest("categoryId must be a valid UUID");
  }

  const existing = await prisma.serviceCategory.findUnique({ where: { id: categoryId } });
  if (!existing) {
    throw ApiError.notFound("Category not found");
  }

  const slug = input.slug?.trim() || (input.name ? slugify(input.name) : undefined);
  if (slug) {
    const clash = await prisma.serviceCategory.findFirst({
      where: { slug, NOT: { id: categoryId } },
      select: { id: true },
    });
    if (clash) {
      throw ApiError.conflict("Another category already uses that slug");
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const category = await tx.serviceCategory.update({
      where: { id: categoryId },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(slug ? { slug } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      include: categoryInclude,
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "CATEGORY_UPDATED",
        entityType: "ServiceCategory",
        entityId: category.id,
        metadata: {
          name: category.name,
          slug: category.slug,
          isActive: category.isActive,
        },
      },
    });

    return category;
  });

  return serializeCategory(updated);
}

/**
 * Categories referenced by problems are deactivated instead of deleted so
 * existing problems keep their taxonomy. Unused categories are removed.
 */
export async function deleteCategory(
  categoryId: string,
  adminId: string,
): Promise<{ id: string; deleted: boolean; isActive: boolean }> {
  if (!isUuid(categoryId)) {
    throw ApiError.badRequest("categoryId must be a valid UUID");
  }

  const category = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { problems: true } } },
  });
  if (!category) {
    throw ApiError.notFound("Category not found");
  }

  const inUse = category._count.problems > 0;

  await prisma.$transaction(async (tx) => {
    if (inUse) {
      await tx.serviceCategory.update({
        where: { id: categoryId },
        data: { isActive: false },
      });
    } else {
      await tx.serviceCategory.delete({ where: { id: categoryId } });
    }

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: inUse ? "CATEGORY_DEACTIVATED" : "CATEGORY_DELETED",
        entityType: "ServiceCategory",
        entityId: categoryId,
        metadata: { name: category.name, problems: category._count.problems },
      },
    });
  });

  return { id: categoryId, deleted: !inUse, isActive: inUse ? false : category.isActive };
}
