import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { maskAddress } from "./problemService";
import { createNotification } from "./notificationService";
import type { Role } from "../../generated/prisma/enums";

/** Default proposal validity window. */
const PROPOSAL_VALIDITY_DAYS = 7;

const PAISE_PER_RUPEE = 100;

export interface ProposalInput {
  /** Rupees; stored as integer paise. */
  price: number;
  estimatedDurationMinutes: number;
  /** ISO datetime string; must be in the future. */
  proposedVisitTime: string;
  diagnosis: string;
  includedServices?: string[];
  excludedServices?: string[];
  notes?: string;
  /** ISO datetime string; defaults to 7 days from now. */
  validUntil?: string;
}

export interface Viewer {
  id: string;
  role: Role;
}

export interface SerializedProposal {
  id: string;
  problemId: string;
  status: string;
  price: number;
  estimatedDurationMinutes: number;
  estimatedDuration: string;
  proposedVisitTime: string;
  validUntil: string;
  diagnosis: string;
  includedServices: string[];
  excludedServices: string[];
  notes: string | null;
  createdAt: string;
  professional: {
    id: string;
    name: string;
    businessName: string | null;
    verified: boolean;
    averageRating: number;
    totalJobs: number;
    experienceYears: number;
    skills: string[];
  };
  problem?: {
    id: string;
    title: string;
    status: string;
    urgency: string;
    category: { id: string; name: string; slug: string };
    budgetMin: number | null;
    budgetMax: number | null;
    maskedAddress: string;
    customerName: string;
  };
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createProposal(
  problemId: string,
  professionalUserId: string,
  input: ProposalInput,
): Promise<SerializedProposal> {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: professionalUserId },
    select: { id: true },
  });

  if (!profile) {
    throw ApiError.forbidden("A professional profile is required to submit proposals");
  }

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { id: true, customerId: true, status: true, expiresAt: true, title: true, deletedAt: true },
  });

  if (!problem || problem.deletedAt) {
    throw ApiError.notFound("Problem not found");
  }

  const accepting =
    ["OPEN", "PROPOSALS_RECEIVED"].includes(problem.status) && problem.expiresAt > new Date();

  if (!accepting) {
    throw ApiError.conflict("This problem is no longer accepting proposals");
  }

  const duplicate = await prisma.proposal.findUnique({
    where: { problemId_professionalId: { problemId: problem.id, professionalId: profile.id } },
    select: { id: true },
  });

  if (duplicate) {
    throw ApiError.conflict("You have already submitted a proposal for this problem");
  }

  const proposedVisitTime = parseFutureDate(input.proposedVisitTime, "proposedVisitTime must be a future date and time");
  const validUntil = input.validUntil
    ? parseFutureDate(input.validUntil, "validUntil must be a future date and time")
    : new Date(Date.now() + PROPOSAL_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const proposal = await tx.proposal.create({
      data: {
        problemId: problem.id,
        professionalId: profile.id,
        price: Math.round(input.price * PAISE_PER_RUPEE),
        estimatedDurationMinutes: input.estimatedDurationMinutes,
        proposedVisitTime,
        diagnosis: input.diagnosis,
        includedServices: input.includedServices ?? [],
        excludedServices: input.excludedServices ?? [],
        notes: input.notes,
        validUntil,
      },
      include: proposalInclude,
    });

    // First bid moves the problem into PROPOSALS_RECEIVED.
    if (problem.status === "OPEN") {
      await tx.problem.update({
        where: { id: problem.id },
        data: { status: "PROPOSALS_RECEIVED" },
      });
    }

    return proposal;
  });

  // Best-effort notification to the customer.
  await createNotification({
    userId: problem.customerId,
    title: "New proposal received",
    message: `A professional submitted a proposal for "${problem.title}".`,
    type: "NEW_PROPOSAL",
    linkUrl: `/customer/problems/${problem.id}/compare`,
  });

  return serializeProposal(result, { id: professionalUserId, role: "PROFESSIONAL" }, true);
}

// ---------------------------------------------------------------------------
// List proposals for a problem
// ---------------------------------------------------------------------------

export async function listProblemProposals(
  problemId: string,
  viewer: Viewer,
): Promise<{ proposals: SerializedProposal[] }> {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: {
      id: true,
      customerId: true,
      status: true,
      expiresAt: true,
      deletedAt: true,
      job: { select: { professionalId: true } },
    },
  });

  if (!problem || problem.deletedAt) {
    throw ApiError.notFound("Problem not found");
  }

  let professionalProfileId: string | null = null;

  if (viewer.role === "CUSTOMER") {
    if (problem.customerId !== viewer.id) {
      throw ApiError.notFound("Problem not found");
    }
  } else if (viewer.role === "PROFESSIONAL") {
    professionalProfileId = await getProfessionalProfileId(viewer.id);
    if (!professionalProfileId) {
      throw ApiError.notFound("Problem not found");
    }

    const holdsJob = problem.job?.professionalId === professionalProfileId;
    const available =
      ["OPEN", "PROPOSALS_RECEIVED"].includes(problem.status) && problem.expiresAt > new Date();

    if (!holdsJob && !available) {
      throw ApiError.notFound("Problem not found");
    }
  }
  // Admin: full access.

  const proposals = await prisma.proposal.findMany({
    where: {
      problemId: problem.id,
      ...(professionalProfileId ? { professionalId: professionalProfileId } : {}),
    },
    orderBy: { createdAt: "asc" },
    include: proposalInclude,
  });

  return {
    proposals: proposals.map((proposal) => serializeProposal(proposal, viewer, professionalProfileId !== null)),
  };
}

// ---------------------------------------------------------------------------
// Single proposal (owner customer, bidding professional, admin)
// ---------------------------------------------------------------------------

export async function getProposalForViewer(
  proposalId: string,
  viewer: Viewer,
): Promise<SerializedProposal> {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: proposalInclude,
  });

  if (!proposal) {
    throw ApiError.notFound("Proposal not found");
  }

  if (viewer.role === "CUSTOMER") {
    if (proposal.problem.customerId !== viewer.id) {
      throw ApiError.notFound("Proposal not found");
    }
  } else if (viewer.role === "PROFESSIONAL") {
    const profileId = await getProfessionalProfileId(viewer.id);
    if (!profileId || proposal.professionalId !== profileId) {
      throw ApiError.notFound("Proposal not found");
    }
  }

  return serializeProposal(proposal, viewer, viewer.role === "PROFESSIONAL");
}

// ---------------------------------------------------------------------------
// List a professional's own proposals
// ---------------------------------------------------------------------------

export async function listProfessionalProposals(
  professionalUserId: string,
  query: { page: number; pageSize: number; status?: string },
): Promise<{ proposals: SerializedProposal[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
  const profile = await getProfessionalProfileId(professionalUserId);
  if (!profile) {
    return {
      proposals: [],
      pagination: { page: query.page, pageSize: query.pageSize, total: 0, totalPages: 0 },
    };
  }

  const where = {
    professionalId: profile,
    ...(query.status ? { status: query.status as never } : {}),
  };

  const [proposals, total] = await prisma.$transaction([
    prisma.proposal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: proposalInclude,
    }),
    prisma.proposal.count({ where }),
  ]);

  return {
    proposals: proposals.map((proposal) => serializeProposal(proposal, { id: professionalUserId, role: "PROFESSIONAL" }, true)),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

// ---------------------------------------------------------------------------
// Withdraw
// ---------------------------------------------------------------------------

export async function withdrawProposal(
  proposalId: string,
  professionalUserId: string,
): Promise<SerializedProposal> {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: professionalUserId },
    select: { id: true },
  });

  if (!profile) {
    throw ApiError.notFound("Proposal not found");
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { id: true, professionalId: true, status: true },
  });

  // Non-owners get 404 so foreign proposal IDs are not leaked.
  if (!proposal || proposal.professionalId !== profile.id) {
    throw ApiError.notFound("Proposal not found");
  }

  if (proposal.status !== "SUBMITTED") {
    throw ApiError.conflict(`A ${proposal.status.toLowerCase()} proposal cannot be withdrawn`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedProposal = await tx.proposal.update({
      where: { id: proposalId },
      data: { status: "WITHDRAWN" },
      include: proposalInclude,
    });

    // If the problem has no active bids left, reopen it for discovery.
    const remaining = await tx.proposal.count({
      where: { problemId: updatedProposal.problemId, status: "SUBMITTED" },
    });

    if (remaining === 0) {
      await tx.problem.updateMany({
        where: { id: updatedProposal.problemId, status: "PROPOSALS_RECEIVED" },
        data: { status: "OPEN" },
      });
    }

    return updatedProposal;
  });

  return serializeProposal(updated, { id: professionalUserId, role: "PROFESSIONAL" }, true);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const proposalInclude = {
  problem: {
    select: {
      id: true,
      customerId: true,
      title: true,
      status: true,
      urgency: true,
      address: true,
      budgetMin: true,
      budgetMax: true,
      category: { select: { id: true, name: true, slug: true } },
      customer: { select: { firstName: true, lastName: true } },
    },
  },
  professional: {
    select: {
      id: true,
      businessName: true,
      averageRating: true,
      totalJobs: true,
      experienceYears: true,
      verificationStatus: true,
      user: { select: { firstName: true, lastName: true } },
      skills: { select: { skill: { select: { name: true } } } },
    },
  },
} as const;

type ProposalWithIncludes = {
  id: string;
  problemId: string;
  status: string;
  price: number;
  estimatedDurationMinutes: number;
  proposedVisitTime: Date;
  validUntil: Date;
  diagnosis: string;
  includedServices: string[];
  excludedServices: string[];
  notes: string | null;
  createdAt: Date;
  problem: {
    id: string;
    customerId: string;
    title: string;
    status: string;
    urgency: string;
    address: string;
    budgetMin: number | null;
    budgetMax: number | null;
    category: { id: string; name: string; slug: string };
    customer: { firstName: string; lastName: string };
  };
  professional: {
    id: string;
    businessName: string | null;
    averageRating: unknown;
    totalJobs: number;
    experienceYears: number;
    verificationStatus: string;
    user: { firstName: string; lastName: string };
    skills: Array<{ skill: { name: string } }>;
  };
};

function serializeProposal(
  proposal: ProposalWithIncludes,
  viewer: Viewer,
  includeProblemSummary: boolean = false,
): SerializedProposal {
  const isProfessional = viewer.role === "PROFESSIONAL";
  const professional = proposal.professional;

  const serialized: SerializedProposal = {
    id: proposal.id,
    problemId: proposal.problemId,
    status: proposal.status,
    price: proposal.price / PAISE_PER_RUPEE,
    estimatedDurationMinutes: proposal.estimatedDurationMinutes,
    estimatedDuration: formatDuration(proposal.estimatedDurationMinutes),
    proposedVisitTime: proposal.proposedVisitTime.toISOString(),
    validUntil: proposal.validUntil.toISOString(),
    diagnosis: proposal.diagnosis,
    includedServices: proposal.includedServices,
    excludedServices: proposal.excludedServices,
    notes: proposal.notes,
    createdAt: proposal.createdAt.toISOString(),
    professional: {
      id: professional.id,
      name: `${professional.user.firstName} ${professional.user.lastName}`,
      businessName: professional.businessName ?? "",
      verified: professional.verificationStatus === "VERIFIED",
      averageRating: Number(professional.averageRating),
      totalJobs: professional.totalJobs,
      experienceYears: professional.experienceYears,
      skills: professional.skills.map((entry) => entry.skill.name),
    },
  };

  if (includeProblemSummary) {
    serialized.problem = {
      id: proposal.problem.id,
      title: proposal.problem.title,
      status: proposal.problem.status,
      urgency: proposal.problem.urgency,
      category: proposal.problem.category,
      budgetMin: proposal.problem.budgetMin
        ? proposal.problem.budgetMin / PAISE_PER_RUPEE
        : null,
      budgetMax: proposal.problem.budgetMax
        ? proposal.problem.budgetMax / PAISE_PER_RUPEE
        : null,
      maskedAddress: maskAddress(proposal.problem.address),
      // Customers' exact identity is not exposed to professionals.
      customerName: isProfessional
        ? `${proposal.problem.customer.firstName} ${proposal.problem.customer.lastName.charAt(0)}.`
        : `${proposal.problem.customer.firstName} ${proposal.problem.customer.lastName}`,
    };
  }

  return serialized;
}

async function getProfessionalProfileId(userId: string): Promise<string | null> {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id ?? null;
}

function parseFutureDate(value: string, message: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    throw ApiError.badRequest(message);
  }
  return date;
}

/** "540" minutes -> "9 hrs" style display string. */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
  if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${mins} min`;
}
