import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { isUuid } from "../utils/isUuid";
import { createNotifications } from "./notificationService";
import type { Prisma } from "../../generated/prisma/client";

export interface ReviewInput {
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  valueRating: number;
  comment?: string;
}

export interface Viewer {
  id: string;
  role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
}

export interface SerializedReview {
  id: string;
  jobId: string;
  customerId: string;
  customerName: string;
  professionalId: string;
  professionalName: string;
  businessName: string | null;
  ratings: {
    overall: number;
    quality: number;
    professionalism: number;
    timeliness: number;
    value: number;
  };
  comment: string | null;
  response: { id: string; text: string; createdAt: string } | null;
  createdAt: string;
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  breakdown: {
    quality: number;
    professionalism: number;
    timeliness: number;
    value: number;
  };
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

// ---------------------------------------------------------------------------
// Create (customer reviews a confirmed job)
// ---------------------------------------------------------------------------

export async function createJobReview(
  jobId: string,
  customerUserId: string,
  input: ReviewInput,
): Promise<{ review: SerializedReview }> {
  if (!isUuid(jobId)) {
    throw ApiError.badRequest("jobId must be a valid UUID");
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, customerId: true, professionalId: true, status: true },
  });

  if (!job) {
    throw ApiError.notFound("Job not found");
  }

  if (job.customerId !== customerUserId) {
    throw ApiError.notFound("Job not found");
  }

  if (job.status !== "CUSTOMER_CONFIRMED") {
    throw ApiError.conflict("Only a customer-confirmed job can be reviewed");
  }

  const existing = await prisma.review.findUnique({ where: { jobId: job.id }, select: { id: true } });
  if (existing) {
    throw ApiError.conflict("This job has already been reviewed");
  }

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        jobId: job.id,
        customerId: customerUserId,
        professionalId: job.professionalId,
        overallRating: input.overallRating,
        qualityRating: input.qualityRating,
        professionalismRating: input.professionalismRating,
        timelinessRating: input.timelinessRating,
        valueRating: input.valueRating,
        comment: input.comment,
      },
      include: reviewInclude,
    });

    // Keep the professional's public aggregates in sync.
    await recomputeProfessionalRatings(tx, job.professionalId);

    return created;
  });

  const professionalUser = await prisma.professionalProfile.findUnique({
    where: { id: job.professionalId },
    select: { userId: true },
  });

  if (professionalUser) {
    await createNotifications([
      {
        userId: professionalUser.userId,
        title: "You received a new review",
        message: `A customer rated your work ${input.overallRating}/5.`,
        type: "REVIEW_RECEIVED" as const,
        linkUrl: `/jobs/${job.id}/review`,
      },
    ]);
  }

  return { review: serializeReview(review) };
}

// ---------------------------------------------------------------------------
// List reviews for a professional
// ---------------------------------------------------------------------------

export async function listProfessionalReviews(
  professionalId: string,
  query: { page: number; pageSize: number },
): Promise<{ reviews: SerializedReview[]; summary: RatingSummary; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
  if (!isUuid(professionalId)) {
    throw ApiError.badRequest("professionalId must be a valid UUID");
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { id: professionalId },
    select: { id: true },
  });

  if (!profile) {
    throw ApiError.notFound("Professional not found");
  }

  const where: Prisma.ReviewWhereInput = { professionalId: profile.id };

  const [reviews, total, aggregate, groups] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: reviewInclude,
    }),
    prisma.review.count({ where }),
    prisma.review.aggregate({
      where,
      _avg: {
        overallRating: true,
        qualityRating: true,
        professionalismRating: true,
        timelinessRating: true,
        valueRating: true,
      },
    }),
    prisma.review.groupBy({
      by: ["overallRating"],
      where,
      _count: { overallRating: true },
    }),
  ]);

  const distribution = buildDistribution(groups);

  const summary: RatingSummary = {
    averageRating: round2(aggregate._avg.overallRating ?? 0),
    totalReviews: total,
    breakdown: {
      quality: round2(aggregate._avg.qualityRating ?? 0),
      professionalism: round2(aggregate._avg.professionalismRating ?? 0),
      timeliness: round2(aggregate._avg.timelinessRating ?? 0),
      value: round2(aggregate._avg.valueRating ?? 0),
    },
    distribution,
  };

  return {
    reviews: reviews.map(serializeReview),
    summary,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

export async function listMyProfessionalReviews(
  professionalUserId: string,
  query: { page: number; pageSize: number },
): Promise<{ reviews: SerializedReview[]; summary: RatingSummary; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
  if (!isUuid(professionalUserId)) {
    throw ApiError.badRequest("Professional user id must be a valid UUID");
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: professionalUserId },
    select: { id: true },
  });

  if (!profile) {
    throw ApiError.notFound("Professional profile not found");
  }

  return listProfessionalReviews(profile.id, query);
}

export async function listMyCustomerReviews(
  customerUserId: string,
  query: { page: number; pageSize: number },
): Promise<{ reviews: SerializedReview[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
  if (!isUuid(customerUserId)) {
    throw ApiError.badRequest("Customer user id must be a valid UUID");
  }

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: { customerId: customerUserId },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: reviewInclude,
    }),
    prisma.review.count({ where: { customerId: customerUserId } }),
  ]);

  return {
    reviews: reviews.map(serializeReview),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

// ---------------------------------------------------------------------------
// Professional response to a review
// ---------------------------------------------------------------------------

export async function respondToReview(
  reviewId: string,
  professionalUserId: string,
  responseText: string,
): Promise<{ review: SerializedReview }> {
  if (!isUuid(reviewId)) {
    throw ApiError.badRequest("reviewId must be a valid UUID");
  }

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: professionalUserId },
    select: { id: true },
  });

  if (!profile) {
    throw ApiError.notFound("Review not found");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, professionalId: true, customerId: true, response: { select: { id: true } } },
  });

  if (!review || review.professionalId !== profile.id) {
    throw ApiError.notFound("Review not found");
  }

  if (review.response) {
    throw ApiError.conflict("This review has already been responded to");
  }

  await prisma.reviewResponse.create({
    data: {
      reviewId: review.id,
      professionalId: profile.id,
      responseText,
    },
  });

  const finalReview = await prisma.review.findUnique({
    where: { id: reviewId },
    include: reviewInclude,
  });

  if (!finalReview) {
    throw ApiError.notFound("Review not found");
  }

  await createNotifications([
    {
      userId: review.customerId,
      title: "The professional responded to your review",
      message: responseText.slice(0, 120),
      type: "REVIEW_RECEIVED" as const,
      linkUrl: "/customer/jobs",
    },
  ]);

  return { review: serializeReview(finalReview) };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const reviewInclude = {
  customer: { select: { firstName: true, lastName: true } },
  professional: {
    select: {
      id: true,
      businessName: true,
      user: { select: { firstName: true, lastName: true } },
    },
  },
  response: { select: { id: true, responseText: true, createdAt: true } },
} as const;

type ReviewWithIncludes = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

function serializeReview(review: ReviewWithIncludes): SerializedReview {
  return {
    id: review.id,
    jobId: review.jobId,
    customerId: review.customerId,
    customerName: `${review.customer.firstName} ${review.customer.lastName}`,
    professionalId: review.professional.id,
    professionalName: `${review.professional.user.firstName} ${review.professional.user.lastName}`,
    businessName: review.professional.businessName,
    ratings: {
      overall: review.overallRating,
      quality: review.qualityRating,
      professionalism: review.professionalismRating,
      timeliness: review.timelinessRating,
      value: review.valueRating,
    },
    comment: review.comment,
    response: review.response
      ? {
          id: review.response.id,
          text: review.response.responseText,
          createdAt: review.response.createdAt.toISOString(),
        }
      : null,
    createdAt: review.createdAt.toISOString(),
  };
}

/** Recomputes averageRating/totalJobs for a professional from source data. */
async function recomputeProfessionalRatings(
  tx: Prisma.TransactionClient,
  professionalId: string,
): Promise<void> {
  const [aggregate, confirmedJobs] = await Promise.all([
    tx.review.aggregate({
      where: { professionalId },
      _avg: { overallRating: true },
      _count: { id: true },
    }),
    tx.job.count({
      where: { professionalId, status: { in: ["CUSTOMER_CONFIRMED", "CLOSED"] } },
    }),
  ]);

  await tx.professionalProfile.update({
    where: { id: professionalId },
    data: {
      averageRating: round2(aggregate._avg.overallRating ?? 0),
      totalJobs: confirmedJobs,
    },
  });
}

function buildDistribution(
  groups: Array<{ overallRating: number; _count: { overallRating: number } }>,
): RatingSummary["distribution"] {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as RatingSummary["distribution"];
  for (const group of groups) {
    if (group.overallRating >= 1 && group.overallRating <= 5) {
      distribution[group.overallRating as 1 | 2 | 3 | 4 | 5] = group._count.overallRating;
    }
  }
  return distribution;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
