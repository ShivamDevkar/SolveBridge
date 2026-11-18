import { Router } from "express";
import { z } from "zod";
import requireAuth from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { parseWith } from "../utils/validate";
import { ApiError } from "../utils/apiError";
import { isUuid } from "../utils/isUuid";
import {
  listMyProfessionalReviews,
  listMyCustomerReviews,
  listProfessionalReviews,
  respondToReview,
} from "../service/reviewService";

const router = Router();

const listQuerySchema = z.object({
  professionalId: z.string().trim().min(1).max(64),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

router.get(
  "/mine",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string; role: "CUSTOMER" | "PROFESSIONAL" };
    const page = 1;
    const pageSize = 50;
    const result =
      user.role === "PROFESSIONAL"
        ? await listMyProfessionalReviews(user.id, { page, pageSize })
        : await listMyCustomerReviews(user.id, { page, pageSize });
    res.json({ success: true, data: result });
  }),
);

// Public catalog data: reviews for a professional profile, with aggregates.
router.get(
  "/",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  asyncHandler(async (req, res) => {
    const query = parseWith(listQuerySchema, req.query);

    const result = await listProfessionalReviews(query.professionalId, {
      page: query.page,
      pageSize: query.pageSize,
    });
    res.json({ success: true, data: result });
  }),
);

const responseSchema = z.object({
  responseText: z.string().trim().min(2, "Response is too short").max(2000),
});

function requireReviewId(req: { params: { reviewId?: string | string[] } }): string {
  const reviewId = typeof req.params.reviewId === "string" ? req.params.reviewId : undefined;
  if (!reviewId || !isUuid(reviewId)) {
    throw ApiError.badRequest("reviewId must be a valid UUID");
  }
  return reviewId;
}

// The reviewed professional responds to their review (once).
router.post(
  "/:reviewId/response",
  requireAuth,
  requireRole("PROFESSIONAL"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string };
    const reviewId = requireReviewId(req);
    const input = parseWith(responseSchema, req.body);

    const result = await respondToReview(reviewId, user.id, input.responseText);
    res.status(201).json({ success: true, data: result });
  }),
);

export default router;
