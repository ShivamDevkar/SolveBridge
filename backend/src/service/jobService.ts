import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { isUuid } from "../utils/isUuid";
import { formatTimeWindow } from "../utils/timeWindow";
import { createNotifications } from "./notificationService";
import type { Prisma } from "../../generated/prisma/client";
import type { JobStatus, Role } from "../../generated/prisma/enums";

const PAISE_PER_RUPEE = 100;

export interface Viewer {
  id: string;
  role: Role;
}

/** Statuses a professional may drive, in strict linear order. */
const PROFESSIONAL_FLOW: JobStatus[] = [
  "SCHEDULED",
  "ON_THE_WAY",
  "ARRIVED",
  "INSPECTION",
  "IN_PROGRESS",
  "COMPLETED",
];

export interface SerializedJob {
  id: string;
  problemId: string;
  proposalId: string;
  status: JobStatus;
  title: string;
  category: { id: string; name: string; slug: string };
  customer: { id: string; name: string };
  professional: {
    id: string;
    userId: string;
    name: string;
    businessName: string | null;
    verified: boolean;
  };
  location: { maskedAddress: string; fullAddress: string };
  scheduledAt: string;
  originalAmount: number;
  currentAmount: number;
  durationEstimate: string | null;
  preferredTimeWindow: string;
  startedAt: string | null;
  completedAt: string | null;
  customerConfirmedAt: string | null;
  closedAt: string | null;
  createdAt: string;
}

export interface SerializedStatusEvent {
  id: string;
  jobId: string;
  oldStatus: string | null;
  newStatus: string;
  actorId: string | null;
  actorName: string;
  actorRole: "CUSTOMER" | "PROFESSIONAL" | "ADMIN" | "SYSTEM";
  title: string;
  description: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Proposal acceptance -> job creation
// ---------------------------------------------------------------------------

export async function acceptProposal(
  proposalId: string,
  customerUserId: string,
): Promise<SerializedJob> {
  if (!isUuid(proposalId)) {
    throw ApiError.badRequest("proposalId must be a valid UUID");
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: {
      id: true,
      status: true,
      validUntil: true,
      price: true,
      proposedVisitTime: true,
      estimatedDurationMinutes: true,
      professionalId: true,
      problemId: true,
      problem: {
        select: {
          id: true,
          customerId: true,
          status: true,
          deletedAt: true,
          job: { select: { id: true } },
        },
      },
    },
  });

  if (!proposal || proposal.problem.deletedAt) {
    throw ApiError.notFound("Proposal not found");
  }

  // Ownership violations must not leak the proposal's existence.
  if (proposal.problem.customerId !== customerUserId) {
    throw ApiError.notFound("Proposal not found");
  }

  if (proposal.problem.job) {
    throw ApiError.conflict("A proposal for this problem was already accepted");
  }

  if (!["OPEN", "PROPOSALS_RECEIVED"].includes(proposal.problem.status)) {
    throw ApiError.conflict("This problem is no longer accepting proposals");
  }

  if (proposal.status !== "SUBMITTED") {
    throw ApiError.conflict(`A ${proposal.status.toLowerCase()} proposal cannot be accepted`);
  }

  if (proposal.validUntil <= new Date()) {
    throw ApiError.conflict("This proposal has expired");
  }

  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.job.create({
      data: {
        problemId: proposal.problemId,
        proposalId: proposal.id,
        customerId: customerUserId,
        professionalId: proposal.professionalId,
        scheduledAt: proposal.proposedVisitTime,
        originalAmount: proposal.price,
        currentAmount: proposal.price,
        status: "SCHEDULED",
      },
    });

    await tx.jobStatusHistory.create({
      data: {
        jobId: created.id,
        oldStatus: null,
        newStatus: "SCHEDULED",
        changedBy: customerUserId,
        reason: "Proposal accepted",
      },
    });

    await tx.proposal.update({
      where: { id: proposal.id },
      data: { status: "ACCEPTED" },
    });

    // Sibling bids lose only if they were still live.
    const rejected = await tx.proposal.updateMany({
      where: { problemId: proposal.problemId, status: "SUBMITTED", id: { not: proposal.id } },
      data: { status: "NOT_SELECTED" },
    });

    await tx.problem.update({
      where: { id: proposal.problemId },
      data: { status: "PROFESSIONAL_SELECTED" },
    });

    return { created, rejectedCount: rejected.count };
  });

  // Notify the winning professional.
  const professionalUser = await prisma.professionalProfile.findUnique({
    where: { id: proposal.professionalId },
    select: { userId: true },
  });

  const notifications: Array<{
    userId: string;
    title: string;
    message: string;
    type: "PROPOSAL_ACCEPTED" | "PROPOSAL_NOT_SELECTED";
    linkUrl: string;
  }> = [];

  if (professionalUser) {
    notifications.push({
      userId: professionalUser.userId,
      title: "Your proposal was accepted",
      message: "The customer accepted your proposal. The job is scheduled — check your workspace.",
      type: "PROPOSAL_ACCEPTED",
      linkUrl: `/jobs/${job.created.id}`,
    });
  }

  // Notify losing bidders (excluding the winner).
  if (job.rejectedCount > 0) {
    const siblings = await prisma.proposal.findMany({
      where: { problemId: proposal.problemId, status: "NOT_SELECTED" },
      select: { professional: { select: { userId: true } } },
    });

    for (const sibling of siblings) {
      if (sibling.professional.userId !== professionalUser?.userId) {
        notifications.push({
          userId: sibling.professional.userId,
          title: "Proposal not selected",
          message: "The customer selected another professional for this problem.",
          type: "PROPOSAL_NOT_SELECTED",
          linkUrl: "/pro/proposals",
        });
      }
    }
  }

  await createNotifications(notifications);

  const createdJob = await prisma.job.findUnique({
    where: { id: job.created.id },
    include: jobInclude,
  });

  if (!createdJob) {
    throw ApiError.notFound("Job not found");
  }

  return serializeJob(createdJob, { id: customerUserId, role: "CUSTOMER" });
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export interface JobListQuery {
  page: number;
  pageSize: number;
  status?: JobStatus;
}

export async function listJobsForViewer(
  viewer: Viewer,
  query: JobListQuery,
): Promise<{ jobs: SerializedJob[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
  const where = buildJobWhere(viewer, query);

  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: jobInclude,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs: jobs.map((job) => serializeJob(job, viewer)),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

// ---------------------------------------------------------------------------
// Detail (participants + admin)
// ---------------------------------------------------------------------------

export async function getJobForViewer(
  jobId: string,
  viewer: Viewer,
): Promise<{ job: SerializedJob; statusHistory: SerializedStatusEvent[] }> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: jobInclude,
  });

  if (!job) {
    throw ApiError.notFound("Job not found");
  }

  const isCustomer = viewer.role === "CUSTOMER" && job.customerId === viewer.id;
  const isAssignedProfessional =
    viewer.role === "PROFESSIONAL" &&
    (await getProfessionalProfileId(viewer.id)) === job.professionalId;

  if (!isCustomer && !isAssignedProfessional && viewer.role !== "ADMIN") {
    throw ApiError.notFound("Job not found");
  }

  const history = await prisma.jobStatusHistory.findMany({
    where: { jobId: job.id },
    orderBy: { createdAt: "asc" },
    include: { actor: { select: { firstName: true, lastName: true, role: true } } },
  });

  return {
    job: serializeJob(job, viewer),
    statusHistory: history.map((entry) => serializeStatusEvent(entry)),
  };
}

// ---------------------------------------------------------------------------
// Status transitions
// ---------------------------------------------------------------------------

export async function advanceJobStatus(
  jobId: string,
  actor: Viewer,
  input: { status: JobStatus; reason?: string },
): Promise<{ job: SerializedJob }> {
  const job = await loadJobForActor(jobId, actor, "PROFESSIONAL");

  const expectedIndex = PROFESSIONAL_FLOW.indexOf(job.status);
  const targetIndex = PROFESSIONAL_FLOW.indexOf(input.status);

  if (expectedIndex === -1) {
    throw ApiError.conflict(`A ${job.status.toLowerCase()} job cannot be advanced by the professional`);
  }
  if (targetIndex === -1 || targetIndex !== expectedIndex + 1) {
    throw ApiError.conflict(
      `Cannot move from ${job.status.toLowerCase()} to ${input.status.toLowerCase()}`,
    );
  }

  const updated = await applyTransition(job.id, job.status, input.status, actor.id, input.reason);

  await notifyCounterpart(job, actor.id, input.status);

  return { job: serializeJob(updated, actor) };
}

export async function confirmJobCompletion(
  jobId: string,
  actor: Viewer,
  input: { notes?: string },
): Promise<{ job: SerializedJob }> {
  const job = await loadJobForActor(jobId, actor, "CUSTOMER");

  if (job.status !== "COMPLETED") {
    throw ApiError.conflict("Only a completed job can be customer-confirmed");
  }

  const updated = await applyTransition(job.id, "COMPLETED", "CUSTOMER_CONFIRMED", actor.id, input.notes);

  await notifyCounterpart(job, actor.id, "CUSTOMER_CONFIRMED");

  return { job: serializeJob(updated, actor) };
}

export async function closeJob(
  jobId: string,
  actor: Viewer,
): Promise<{ job: SerializedJob }> {
  const job = await loadJobForActor(jobId, actor, "CUSTOMER", "PROFESSIONAL");

  if (job.status !== "CUSTOMER_CONFIRMED") {
    throw ApiError.conflict(
      `Cannot close a job with status ${job.status.toLowerCase()}; customer confirmation is required`,
    );
  }

  const updated = await applyTransition(
    job.id,
    "CUSTOMER_CONFIRMED",
    "CLOSED",
    actor.id,
  );

  await notifyCounterpart(job, actor.id, "CLOSED");
  return { job: serializeJob(updated, actor) };
}

export async function cancelJob(
  jobId: string,
  actor: Viewer,
  input: { reason?: string },
): Promise<{ job: SerializedJob }> {
  const job = await loadJobForActor(jobId, actor, "CUSTOMER", "PROFESSIONAL");

  if (job.status !== "SCHEDULED") {
    throw ApiError.conflict("Only a scheduled job can be cancelled");
  }

  const updated = await applyTransition(job.id, "SCHEDULED", "CANCELLED", actor.id, input.reason);

  await notifyCounterpart(job, actor.id, "CANCELLED");

  return { job: serializeJob(updated, actor) };
}

// ---------------------------------------------------------------------------
// Schedule changes + progress notes (activity feed)
// ---------------------------------------------------------------------------

export async function updateJobSchedule(
  jobId: string,
  actor: Viewer,
  input: { scheduledAt: string; note?: string },
): Promise<{ job: SerializedJob }> {
  const job = await loadJobForActor(jobId, actor, "CUSTOMER", "PROFESSIONAL");

  if (job.status !== "SCHEDULED") {
    throw ApiError.conflict("Only a scheduled job can be rescheduled");
  }

  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
    throw ApiError.badRequest("scheduledAt must be a future date and time");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.job.update({ where: { id: job.id }, data: { scheduledAt } });
    await tx.jobStatusHistory.create({
      data: {
        jobId: job.id,
        oldStatus: job.status,
        newStatus: job.status,
        changedBy: actor.id,
        reason: input.note ?? `Rescheduled to ${scheduledAt.toISOString()}`,
      },
    });

    const row = await tx.job.findUnique({ where: { id: job.id }, include: jobInclude });
    if (!row) {
      throw ApiError.notFound("Job not found");
    }
    return row;
  });

  await notifyCounterpart(job, actor.id, job.status);

  return { job: serializeJob(updated, actor) };
}

/** Appends a note to the job activity feed without changing the status. */
export async function addJobProgressNote(
  jobId: string,
  actor: Viewer,
  note: string,
): Promise<{ event: SerializedStatusEvent }> {
  const job = await loadJobForActor(jobId, actor, "CUSTOMER", "PROFESSIONAL");

  if (["CANCELLED", "CUSTOMER_CONFIRMED", "CLOSED", "REFUNDED"].includes(job.status)) {
    throw ApiError.conflict(`A ${job.status.toLowerCase()} job cannot receive updates`);
  }

  const entry = await prisma.jobStatusHistory.create({
    data: {
      jobId: job.id,
      oldStatus: job.status,
      newStatus: job.status,
      changedBy: actor.id,
      reason: note,
    },
    include: { actor: { select: { firstName: true, lastName: true, role: true } } },
  });

  await notifyCounterpart(job, actor.id, job.status);

  return { event: serializeStatusEvent(entry) };
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export interface MessageInput {
  content?: string;
  attachment?: { url: string; name?: string };
}

export async function sendJobMessage(
  jobId: string,
  actor: Viewer,
  input: MessageInput,
): Promise<{ message: SerializedMessage }> {
  const job = await loadJobForActor(jobId, actor, "CUSTOMER", "PROFESSIONAL", "ADMIN");

  if (["COMPLETED", "CUSTOMER_CONFIRMED", "CLOSED", "CANCELLED", "REFUNDED"].includes(job.status)) {
    throw ApiError.conflict("Chat is closed for this job");
  }

  const hasContent = typeof input.content === "string" && input.content.trim().length > 0;
  const hasAttachment = Boolean(input.attachment?.url);

  if (!hasContent && !hasAttachment) {
    throw ApiError.badRequest("Message content or attachment is required");
  }

  const messageType = hasAttachment && !hasContent ? "IMAGE" : "TEXT";
  const message = await prisma.message.create({
    data: {
      jobId: job.id,
      senderId: actor.id,
      messageType,
      messageText: hasContent ? input.content!.trim() : null,
      attachmentUrl: input.attachment?.url ?? null,
    },
    include: messageSenderInclude,
  });

  // Notify the counterpart about the new message.
  const counterpartId =
    actor.id === job.customerId
      ? (await prisma.professionalProfile.findUnique({
          where: { id: job.professionalId },
          select: { userId: true },
        }))?.userId
      : job.customerId;

  if (counterpartId) {
    await createNotifications([
      {
        userId: counterpartId,
        title: "New message",
        message: hasContent ? input.content!.slice(0, 120) : "Sent an image.",
        type: "NEW_MESSAGE" as const,
        linkUrl: `/jobs/${job.id}/chat`,
      },
    ]);
  }

  return { message: serializeMessage(message) };
}

export async function listJobMessages(
  jobId: string,
  actor: Viewer,
  query: { limit: number; before?: Date },
): Promise<{ messages: SerializedMessage[]; hasMore: boolean }> {
  const job = await loadJobForActor(jobId, actor, "CUSTOMER", "PROFESSIONAL", "ADMIN");

  const where: Prisma.MessageWhereInput = {
    jobId: job.id,
    ...(query.before ? { createdAt: { lt: query.before } } : {}),
  };

  // Fetch one extra row to detect whether an older page exists.
  const rows = await prisma.message.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: query.limit + 1,
    include: messageSenderInclude,
  });

  const hasMore = rows.length > query.limit;
  const page = rows.slice(0, query.limit).reverse(); // oldest -> newest for chat display

  return { messages: page.map(serializeMessage), hasMore };
}

export async function markJobMessagesRead(
  jobId: string,
  actor: Viewer,
): Promise<{ updated: number }> {
  const job = await loadJobForActor(jobId, actor, "CUSTOMER", "PROFESSIONAL", "ADMIN");

  const result = await prisma.message.updateMany({
    where: { jobId: job.id, isRead: false, senderId: { not: actor.id } },
    data: { isRead: true },
  });

  return { updated: result.count };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const jobInclude = {
  problem: {
    select: {
      title: true,
      address: true,
      preferredTimeStart: true,
      preferredTimeEnd: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  },
  proposal: { select: { estimatedDurationMinutes: true } },
  customer: { select: { id: true, firstName: true, lastName: true } },
  professional: {
    select: {
      id: true,
      businessName: true,
      verificationStatus: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
} as const;

type JobWithIncludes = Prisma.JobGetPayload<{ include: typeof jobInclude }>;

interface StatusEventRow {
  id: string;
  jobId: string;
  oldStatus: JobStatus | null;
  newStatus: JobStatus;
  changedBy: string | null;
  reason: string | null;
  createdAt: Date;
  actor?: { firstName: string; lastName: string; role: Role } | null;
}

const messageSenderInclude = {
  sender: { select: { id: true, firstName: true, lastName: true, role: true } },
} as const;

type MessageRow = Prisma.MessageGetPayload<{ include: typeof messageSenderInclude }>;

export interface SerializedMessage {
  id: string;
  jobId: string;
  senderId: string | null;
  senderName: string;
  senderRole: "CUSTOMER" | "PROFESSIONAL" | "ADMIN" | "SYSTEM";
  content: string;
  messageType: string;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

function serializeMessage(message: MessageRow): SerializedMessage {
  const sender = message.sender;
  return {
    id: message.id,
    jobId: message.jobId,
    senderId: sender?.id ?? null,
    senderName: sender ? `${sender.firstName} ${sender.lastName}` : "System",
    senderRole: (sender?.role ?? "SYSTEM") as SerializedMessage["senderRole"],
    content: message.messageText ?? "",
    messageType: message.messageType,
    attachmentUrl: message.attachmentUrl,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
  };
}

function serializeJob(job: JobWithIncludes, viewer: Viewer): SerializedJob {
  void viewer;
  return {
    id: job.id,
    problemId: job.problemId,
    proposalId: job.proposalId,
    status: job.status,
    title: job.problem.title,
    category: job.problem.category,
    customer: {
      id: job.customer.id,
      name: `${job.customer.firstName} ${job.customer.lastName}`,
    },
    professional: {
      id: job.professional.id,
      userId: job.professional.user.id,
      name: `${job.professional.user.firstName} ${job.professional.user.lastName}`,
      businessName: job.professional.businessName,
      verified: job.professional.verificationStatus === "VERIFIED",
    },
    // Both participants see the exact address inside the job workspace.
    location: { maskedAddress: job.problem.address, fullAddress: job.problem.address },
    scheduledAt: job.scheduledAt.toISOString(),
    originalAmount: job.originalAmount / PAISE_PER_RUPEE,
    currentAmount: job.currentAmount / PAISE_PER_RUPEE,
    durationEstimate: job.proposal.estimatedDurationMinutes
      ? formatDuration(job.proposal.estimatedDurationMinutes)
      : null,
    preferredTimeWindow: formatTimeWindow(
      job.problem.preferredTimeStart
        ? job.problem.preferredTimeStart.toISOString().slice(11, 16)
        : null,
      job.problem.preferredTimeEnd
        ? job.problem.preferredTimeEnd.toISOString().slice(11, 16)
        : null,
    ),
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    customerConfirmedAt: job.customerConfirmedAt?.toISOString() ?? null,
    closedAt: job.closedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
  };
}

function serializeStatusEvent(entry: StatusEventRow): SerializedStatusEvent {
  return {
    id: entry.id,
    jobId: entry.jobId,
    oldStatus: entry.oldStatus,
    newStatus: entry.newStatus,
    actorId: entry.changedBy,
    actorName: entry.actor ? `${entry.actor.firstName} ${entry.actor.lastName}` : "System",
    actorRole: (entry.actor?.role ?? "SYSTEM") as SerializedStatusEvent["actorRole"],
    title: entry.newStatus,
    description: entry.reason,
    createdAt: entry.createdAt.toISOString(),
  };
}

function buildJobWhere(viewer: Viewer, query: JobListQuery): Prisma.JobWhereInput {
  if (viewer.role === "CUSTOMER") {
    return {
      customerId: viewer.id,
      ...(query.status ? { status: query.status } : {}),
    };
  }

  // Professional listing: resolved to their profile id in the route caller via
  // a subquery because Job stores professionalId (profile id), not userId.
  if (viewer.role === "PROFESSIONAL") {
    return {
      professional: { userId: viewer.id },
      ...(query.status ? { status: query.status } : {}),
    };
  }

  return {
    ...(query.status ? { status: query.status } : {}),
  };
}

/**
 * Loads the job and enforces that the actor is one of the given participant
 * roles for this specific job (customer = job.customerId, professional = the
 * assigned profile, admin = full access). Non-participants get 404.
 */
async function loadJobForActor(
  jobId: string,
  actor: Viewer,
  ...allowedRoles: Array<"CUSTOMER" | "PROFESSIONAL" | "ADMIN">
): Promise<JobWithIncludes> {
  if (!isUuid(jobId)) {
    throw ApiError.badRequest("jobId must be a valid UUID");
  }

  const job = await prisma.job.findUnique({ where: { id: jobId }, include: jobInclude });

  if (!job) {
    throw ApiError.notFound("Job not found");
  }

  const participant =
    (allowedRoles.includes("CUSTOMER") && actor.role === "CUSTOMER" && job.customerId === actor.id) ||
    (allowedRoles.includes("PROFESSIONAL") &&
      actor.role === "PROFESSIONAL" &&
      (await getProfessionalProfileId(actor.id)) === job.professionalId) ||
    (allowedRoles.includes("ADMIN") && actor.role === "ADMIN");

  if (!participant) {
    throw ApiError.notFound("Job not found");
  }

  return job;
}

async function applyTransition(
  jobId: string,
  oldStatus: JobStatus,
  newStatus: JobStatus,
  actorId: string,
  reason?: string,
): Promise<JobWithIncludes> {
  const now = new Date();
  const lifecycleUpdates =
    newStatus === "IN_PROGRESS"
      ? { startedAt: now }
      : newStatus === "COMPLETED"
        ? { completedAt: now }
        : newStatus === "CUSTOMER_CONFIRMED"
          ? { customerConfirmedAt: now }
          : newStatus === "CANCELLED"
            ? { closedAt: now }
            : {};

  return prisma.$transaction(async (tx) => {
    await tx.job.update({ where: { id: jobId }, data: { status: newStatus, ...lifecycleUpdates } });

    await tx.jobStatusHistory.create({
      data: { jobId, oldStatus, newStatus, changedBy: actorId, reason: reason ?? null },
    });

    const updated = await tx.job.findUnique({ where: { id: jobId }, include: jobInclude });
    if (!updated) {
      throw ApiError.notFound("Job not found");
    }
    return updated;
  });
}

/** Notifies the party who did NOT perform the action. */
async function notifyCounterpart(
  job: JobWithIncludes,
  actorId: string,
  newStatus: JobStatus,
): Promise<void> {
  const actorIsCustomer = actorId === job.customerId;

  const counterpartId = actorIsCustomer
    ? (
        await prisma.professionalProfile.findUnique({
          where: { id: job.professionalId },
          select: { userId: true },
        })
      )?.userId
    : job.customerId;

  if (!counterpartId) return;

  await createNotifications([
    {
      userId: counterpartId,
      title: "Job status updated",
      message: `"${job.problem.title}" is now ${formatStatus(newStatus)}.`,
      type: "JOB_STATUS_CHANGED" as const,
      linkUrl: `/jobs/${job.id}`,
    },
  ]);
}

async function getProfessionalProfileId(userId: string): Promise<string | null> {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id ?? null;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
  if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${mins} min`;
}

function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
