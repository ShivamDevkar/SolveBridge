import { Router, type Request } from "express";
import { z } from "zod";
import requireAuth from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { parseWith } from "../utils/validate";
import { ApiError } from "../utils/apiError";
import {
  addJobProgressNote,
  advanceJobStatus,
  cancelJob,
  closeJob,
  confirmJobCompletion,
  getJobForViewer,
  listJobMessages,
  listJobsForViewer,
  markJobMessagesRead,
  sendJobMessage,
  updateJobSchedule,
} from "../service/jobService";
import { createJobReview } from "../service/reviewService";

const router = Router();

function requireJobId(req: Request): string {
  const jobId =
    typeof req.params.jobId === "string" ? req.params.jobId : undefined;
  if (!jobId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
    throw ApiError.badRequest("jobId must be a valid UUID");
  }
  return jobId;
}

const JOB_STATUSES = [
  "SCHEDULED",
  "ON_THE_WAY",
  "ARRIVED",
  "INSPECTION",
  "IN_PROGRESS",
  "COMPLETED",
  "CUSTOMER_CONFIRMED",
  "CLOSED",
  "CANCELLED",
  "DISPUTED",
  "REASSIGNED",
  "REFUNDED",
] as const;

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(JOB_STATUSES).optional(),
});

// Customers list their own jobs; professionals list assigned jobs; admins all.
router.get(
  "/",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as {
      id: string;
      role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
    };
    const query = parseWith(listQuerySchema, req.query);

    const result = await listJobsForViewer({ id: user.id, role: user.role }, query);
    res.json({ success: true, data: result });
  }),
);

router.get(
  "/:jobId",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as {
      id: string;
      role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
    };

    const result = await getJobForViewer(requireJobId(req), { id: user.id, role: user.role });
    res.json({ success: true, data: result });
  }),
);

// Professional drives the on-site flow, one step at a time.
const statusSchema = z.object({
  status: z.enum(["ON_THE_WAY", "ARRIVED", "INSPECTION", "IN_PROGRESS", "COMPLETED"]),
  reason: z.string().trim().max(1000).optional(),
});

router.post(
  "/:jobId/status",
  requireAuth,
  requireRole("PROFESSIONAL"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string; role: "PROFESSIONAL" };
    const input = parseWith(statusSchema, req.body);

    const result = await advanceJobStatus(requireJobId(req), user, input);
    res.json({ success: true, data: result });
  }),
);

// Customer confirms completion.
const confirmSchema = z.object({
  notes: z.string().trim().max(1000).optional(),
});

router.post(
  "/:jobId/confirm",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string; role: "CUSTOMER" };
    const input = parseWith(confirmSchema, req.body);

    const result = await confirmJobCompletion(requireJobId(req), user, input);
    res.json({ success: true, data: result });
  }),
);

router.post(
  "/:jobId/close",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as {
      id: string;
      role: "CUSTOMER" | "PROFESSIONAL";
    };
    const result = await closeJob(requireJobId(req), user);
    res.json({ success: true, data: result });
  }),
);

// Either party cancels while the job is still only scheduled.
const cancelSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

router.post(
  "/:jobId/cancel",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string; role: "CUSTOMER" | "PROFESSIONAL" };
    const input = parseWith(cancelSchema, req.body);

    const result = await cancelJob(requireJobId(req), user, input);
    res.json({ success: true, data: result });
  }),
);

// Either party reschedules while the job is still only scheduled.
const scheduleSchema = z.object({
  scheduledAt: z.string().trim().datetime({ offset: true }),
  note: z.string().trim().max(1000).optional(),
});

router.patch(
  "/:jobId/schedule",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string; role: "CUSTOMER" | "PROFESSIONAL" };
    const input = parseWith(scheduleSchema, req.body);

    const result = await updateJobSchedule(requireJobId(req), user, input);
    res.json({ success: true, data: result });
  }),
);

// Activity-feed note without a status change.
const progressNoteSchema = z.object({
  note: z.string().trim().min(2, "Note is too short").max(2000),
});

router.post(
  "/:jobId/updates",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string; role: "CUSTOMER" | "PROFESSIONAL" };
    const input = parseWith(progressNoteSchema, req.body);

    const result = await addJobProgressNote(requireJobId(req), user, input.note);
    res.status(201).json({ success: true, data: result });
  }),
);

// Customer reviews the job after confirming it.
const reviewSchema = z.object({
  overallRating: z.number().int().min(1).max(5),
  qualityRating: z.number().int().min(1).max(5),
  professionalismRating: z.number().int().min(1).max(5),
  timelinessRating: z.number().int().min(1).max(5),
  valueRating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

router.post(
  "/:jobId/review",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string; role: "CUSTOMER" };
    const input = parseWith(reviewSchema, req.body);

    const result = await createJobReview(requireJobId(req), user.id, input);
    res.status(201).json({ success: true, data: result });
  }),
);

// ---------------------------------------------------------------------------
// Job messages (chat)
// ---------------------------------------------------------------------------

const messageListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().trim().datetime({ offset: true }).optional(),
});

router.get(
  "/:jobId/messages",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as {
      id: string;
      role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
    };
    const query = parseWith(messageListQuerySchema, req.query);

    const result = await listJobMessages(requireJobId(req), { id: user.id, role: user.role }, {
      limit: query.limit,
      before: query.before ? new Date(query.before) : undefined,
    });
    res.json({ success: true, data: result });
  }),
);

const messageSchema = z
  .object({
    content: z.string().trim().min(1, "Message cannot be empty").max(4000).optional(),
    attachment: z
      .object({
        url: z.string().min(1).max(2_000_000), // data URLs are large
        name: z.string().trim().max(255).optional(),
      })
      .optional(),
  })
  .refine((value) => Boolean(value.content || value.attachment), {
    message: "Message content or attachment is required",
  });

router.post(
  "/:jobId/messages",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as {
      id: string;
      role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
    };
    const input = parseWith(messageSchema, req.body);

    const result = await sendJobMessage(requireJobId(req), { id: user.id, role: user.role }, input);
    res.status(201).json({ success: true, data: result });
  }),
);

router.post(
  "/:jobId/messages/read-all",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as {
      id: string;
      role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
    };

    const result = await markJobMessagesRead(requireJobId(req), { id: user.id, role: user.role });
    res.json({ success: true, data: result });
  }),
);

export default router;
