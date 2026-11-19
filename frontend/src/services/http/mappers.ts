/**
 * Mappers between backend API payloads and the frontend domain types consumed
 * by the existing pages. Keeping the translation here lets every page keep
 * using the shapes it was designed around (see `types/*`).
 */
import type { Problem, ProblemStatus } from "@/types/problem";
import type { Proposal, ProposalStatus } from "@/types/proposal";
import type { Job, JobActivityEvent, JobLifecycleStatus } from "@/types/job";
import type { ChatMessage, MessageSenderRole, MessageType } from "@/types/message";
import type { UrgencyLevel } from "@/types/common";

/**
 * The existing UI uses broad display labels (e.g. "Home Appliances & HVAC")
 * while the backend taxonomy is seeded with trade-level categories. Normalise
 * the label to a backend slug so problem creation lands in a real category.
 */
const CATEGORY_SLUG_BY_LABEL: Record<string, string> = {
  "Home Appliances & HVAC": "appliance-repair",
  "Plumbing & Water Systems": "plumbing",
  "Electrical Systems": "electrical",
  "Vehicle & Roadside Breakdown": "vehicle-roadside",
  "Tech Hardware & Networking": "computer-network",
  "Commercial Facility Maintenance": "commercial-facility",
  "General Diagnosis": "general-diagnosis",
};

export function toCategorySlug(label?: string): string | undefined {
  if (!label) return undefined;

  const trimmed = label.trim();
  if (!trimmed) return undefined;

  const mapped = CATEGORY_SLUG_BY_LABEL[trimmed];
  if (mapped) return mapped;

  // Already a backend slug or name in slug form.
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) return trimmed;

  return undefined;
}

export interface ApiProblem {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: { id: string; name: string; slug: string } | null;
  urgency: UrgencyLevel;
  status: string;
  location: {
    maskedAddress: string;
    fullAddress: string | null;
    city: string;
    neighborhood: string;
  };
  budgetMin: number | null;
  budgetMax: number | null;
  preferredDate: string | null;
  preferredTimeWindow: string;
  images: string[];
  proposalsCount: number;
  customerName: string;
  distanceKm: number | null;
  hasProposed?: boolean;
  expiresAt: string;
  createdAt: string;
}

export function mapProblem(problem: ApiProblem): Problem {
  return {
    id: problem.id,
    customerId: problem.customerId,
    customerName: problem.customerName,
    title: problem.title,
    description: problem.description,
    category: problem.category?.name ?? "",
    urgency: problem.urgency,
    location: {
      city: problem.location.city,
      neighborhood: problem.location.neighborhood,
      distanceKm: problem.distanceKm ?? undefined,
      maskedAddress: problem.location.maskedAddress,
      fullAddress: problem.location.fullAddress ?? undefined,
    },
    budgetMin: problem.budgetMin ?? undefined,
    budgetMax: problem.budgetMax ?? undefined,
    preferredDate: problem.preferredDate ?? "",
    preferredTimeWindow: problem.preferredTimeWindow,
    mediaUrls: problem.images ?? [],
    status: problem.status as ProblemStatus,
    proposalsCount: problem.proposalsCount ?? 0,
    createdAt: problem.createdAt,
  };
}

export interface ApiProposal {
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
    userId: string;
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

/** Formats a backend ISO timestamp for the read-only visit-time labels. */
export function toDisplayDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function mapProposal(proposal: ApiProposal): Proposal {
  return {
    id: proposal.id,
    problemId: proposal.problemId,
    professionalId: proposal.professional.id,
    professionalName: proposal.professional.name,
    businessName: proposal.professional.businessName ?? undefined,
    verified: proposal.professional.verified,
    averageRating: Number(proposal.professional.averageRating ?? 0),
    completedJobsCount: proposal.professional.totalJobs ?? 0,
    experienceYears: proposal.professional.experienceYears ?? 0,
    estimatedPrice: proposal.price,
    estimatedDuration: proposal.estimatedDuration,
    proposedVisitTime: toDisplayDateTime(proposal.proposedVisitTime),
    initialDiagnosis: proposal.diagnosis,
    includedServices: proposal.includedServices ?? [],
    excludedServices: proposal.excludedServices ?? [],
    notes: proposal.notes ?? undefined,
    // AI matching is deferred; keep a neutral breakdown so the UI renders.
    matchScore: {
      overall: 0,
      skillMatch: 0,
      distanceMatch: 0,
      availabilityMatch: 0,
      ratingMatch: 0,
      responseSpeedMatch: 0,
    },
    status: proposal.status as ProposalStatus,
    validUntil: proposal.validUntil,
    createdAt: proposal.createdAt,
  };
}

export interface ApiStatusEvent {
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

export interface ApiJob {
  id: string;
  problemId: string;
  proposalId: string;
  status: string;
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

export function mapJob(job: ApiJob, statusHistory?: ApiStatusEvent[]): Job {
  const completion = statusHistory
    ?.slice()
    .reverse()
    .find((entry) => entry.newStatus === "COMPLETED" && entry.description);
  const workStartedEvent = statusHistory
    ?.slice()
    .reverse()
    .find((entry) => entry.newStatus === "IN_PROGRESS");

  return {
    id: job.id,
    problemId: job.problemId,
    proposalId: job.proposalId,
    customerId: job.customer.id,
    customerName: job.customer.name,
    professionalId: job.professional.id,
    professionalUserId: job.professional.userId,
    professionalName: job.professional.name,
    category: job.category?.name ?? "",
    title: job.title,
    scheduledAt: toDisplayDateTime(job.scheduledAt),
    status: job.status as JobLifecycleStatus,
    originalAmount: job.originalAmount,
    currentAmount: job.currentAmount,
    exactServiceAddress: job.location.fullAddress,
    durationEstimate: job.durationEstimate ?? undefined,
    completionDetails: completion
      ? {
          workDone: completion.description ?? "",
          completedAt: job.completedAt ?? completion.createdAt,
          confirmedAt: job.customerConfirmedAt ?? undefined,
        }
      : undefined,
    startedAt: job.startedAt ?? workStartedEvent?.createdAt ?? undefined,
    completedAt: job.completedAt ?? undefined,
    customerConfirmedAt: job.customerConfirmedAt ?? undefined,
    closedAt: job.closedAt ?? undefined,
    createdAt: job.createdAt,
  };
}

export function mapActivity(entry: ApiStatusEvent): JobActivityEvent {
  return {
    id: entry.id,
    jobId: entry.jobId,
    title: entry.newStatus.replace(/_/g, " "),
    description: entry.description ?? "",
    actorRole: entry.actorRole,
    actorName: entry.actorName,
    status: entry.newStatus as JobLifecycleStatus,
    timestamp: entry.createdAt,
  };
}

export interface ApiMessage {
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

export function mapMessage(message: ApiMessage): ChatMessage {
  return {
    id: message.id,
    jobId: message.jobId,
    senderId: message.senderId ?? "",
    senderName: message.senderName,
    senderRole: message.senderRole as MessageSenderRole,
    content: message.content,
    createdAt: message.createdAt,
    messageType: message.messageType as MessageType,
    attachmentUrl: message.attachmentUrl ?? undefined,
    attachmentName: message.attachmentUrl ? "attachment" : undefined,
    isRead: message.isRead,
    status: "sent",
  };
}

/**
 * Normalises free-text schedule/visit inputs (e.g. "Preferred: 2026-11-19
 * (Morning (08:00 AM - 12:00 PM))") into a future ISO timestamp the backend
 * accepts.
 */
export function toFutureIso(value: string): string {
  const trimmed = value.trim();
  const now = Date.now();

  // Explicit ISO datetime (used by reschedule round-trips): trust it directly.
  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    const direct = new Date(trimmed);
    if (!Number.isNaN(direct.getTime()) && direct.getTime() > now) {
      return direct.toISOString();
    }
  }

  const dateMatch = trimmed.match(/(\d{4})-(\d{2})-(\d{2})/);

  // No calendar date at all — let the engine try (e.g. "Tomorrow, 10:00 AM").
  if (!dateMatch) {
    const direct = new Date(trimmed);
    if (!Number.isNaN(direct.getTime()) && direct.getTime() > now) {
      return direct.toISOString();
    }
  }

  const base = new Date();
  if (dateMatch) {
    base.setFullYear(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]));
  }
  base.setHours(10, 0, 0, 0);

  const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (timeMatch) {
    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const meridiem = timeMatch[3]?.toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    base.setHours(hours, minutes, 0, 0);
  }

  while (base.getTime() <= Date.now()) {
    base.setDate(base.getDate() + 1);
  }

  return base.toISOString();
}

/** Converts display durations ("1–2 hours", "45 min") into minutes. */
export function toDurationMinutes(value: string): number {
  const text = value.toLowerCase();

  const hourRange = text.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(?:hour|hr)/);
  if (hourRange) {
    return Math.max(1, Math.round(Number(hourRange[2]) * 60));
  }

  const hours = text.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr)/);
  if (hours) {
    return Math.max(1, Math.round(Number(hours[1]) * 60));
  }

  const minutes = text.match(/(\d+)\s*(?:minute|min)/);
  if (minutes) {
    return Number(minutes[1]);
  }

  return 60;
}
