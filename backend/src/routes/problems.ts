import { Router, type Request } from "express";
import { z } from "zod";
import requireAuth from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { parseWith } from "../utils/validate";
import { ApiError } from "../utils/apiError";
import { isUuid } from "../utils/isUuid";
import {
  cancelCustomerProblem,
  createCustomerProblem,
  getProblemForViewer,
  listProblemsForViewer,
  updateCustomerProblem,
  type ProblemInput,
} from "../service/problemService";
import {
  createProposal,
  listProblemProposals,
  type ProposalInput,
} from "../service/proposalService";

const router = Router();

const PROBLEM_STATUSES = [
  "OPEN",
  "MATCHING",
  "PROPOSALS_RECEIVED",
  "PROFESSIONAL_SELECTED",
  "EXPIRED",
  "CANCELLED",
] as const;

const URGENCIES = ["NORMAL", "SOON", "URGENT"] as const;

const categoryFields = {
  categoryId: z.string().trim().optional(),
  categorySlug: z.string().trim().max(140).optional(),
  categoryName: z.string().trim().max(120).optional(),
};

const createProblemSchema = z
  .object({
    title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(5000),
    urgency: z.enum(URGENCIES).default("NORMAL"),
    // Rupees; the server converts to paise for storage.
    budgetMin: z.number().int().min(0).max(10_000_000).optional(),
    budgetMax: z.number().int().min(1).max(10_000_000).optional(),
    preferredDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "preferredDate must be YYYY-MM-DD")
      .optional(),
    preferredTimeWindow: z.string().trim().max(120).optional(),
    city: z.string().trim().min(2).max(100),
    neighborhood: z.string().trim().min(2).max(150),
    landmark: z.string().trim().max(200).optional(),
    images: z.array(z.string().trim().min(1).max(2000)).max(5).optional(),
    ...categoryFields,
  })
  .refine((value) => !value.budgetMax || !value.budgetMin || value.budgetMax >= value.budgetMin, {
    message: "budgetMax must be greater than or equal to budgetMin",
  })
  .refine(
    (value) => Boolean(value.categoryId || value.categorySlug || value.categoryName),
    { message: "A service category is required" },
  );

const updateProblemSchema = z
  .object({
    title: z.string().trim().min(5).max(200).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    urgency: z.enum(URGENCIES).optional(),
    budgetMin: z.number().int().min(0).max(10_000_000).optional(),
    budgetMax: z.number().int().min(1).max(10_000_000).optional(),
    preferredDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "preferredDate must be YYYY-MM-DD")
      .nullable()
      .optional(),
    preferredTimeWindow: z.string().trim().max(120).nullable().optional(),
    city: z.string().trim().min(2).max(100).optional(),
    neighborhood: z.string().trim().min(2).max(150).optional(),
    landmark: z.string().trim().max(200).optional(),
    images: z.array(z.string().trim().min(1).max(2000)).max(5).optional(),
    categoryId: z.string().trim().optional(),
    categorySlug: z.string().trim().max(140).optional(),
    categoryName: z.string().trim().max(120).optional(),
  })
  .refine(
    (value) => !value.budgetMax || !value.budgetMin || value.budgetMax >= value.budgetMin,
    { message: "budgetMax must be greater than or equal to budgetMin" },
  );

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(PROBLEM_STATUSES).optional(),
  urgency: z.enum(URGENCIES).optional(),
  category: z.string().trim().max(140).optional(),
  search: z.string().trim().max(100).optional(),
});

// Customers list their own problems; professionals list available problems;
// admins list everything. All authenticated, all validated.
router.get(
  "/",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string; role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN" };
    const query = parseWith(listQuerySchema, req.query);

    const result = await listProblemsForViewer({ id: user.id, role: user.role }, query);
    res.json({ success: true, data: result });
  }),
);

// Customer only: create a problem. customerId always comes from the token.
router.post(
  "/",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string };
    const input = parseWith(createProblemSchema, req.body) as ProblemInput;

    const problem = await createCustomerProblem(user.id, input);
    res.status(201).json({ success: true, data: { problem } });
  }),
);

function requireProblemId(req: Request): string {
  const problemId =
    typeof req.params.problemId === "string" ? req.params.problemId : undefined;
  if (!problemId || !isUuid(problemId)) {
    throw ApiError.badRequest("problemId must be a valid UUID");
  }
  return problemId;
}

router.get(
  "/:problemId",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string; role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN" };
    const problemId = requireProblemId(req);

    const problem = await getProblemForViewer(problemId, { id: user.id, role: user.role });
    res.json({ success: true, data: { problem } });
  }),
);

router.patch(
  "/:problemId",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string };
    const problemId = requireProblemId(req);
    const input = parseWith(updateProblemSchema, req.body);

    const problem = await updateCustomerProblem(problemId, user.id, input);
    res.json({ success: true, data: { problem } });
  }),
);

router.post(
  "/:problemId/cancel",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string };
    const problemId = requireProblemId(req);

    const problem = await cancelCustomerProblem(problemId, user.id);
    res.json({ success: true, data: { problem } });
  }),
);

// ---------------------------------------------------------------------------
// Proposals nested under a problem
// ---------------------------------------------------------------------------

const PROPOSAL_STATUSES = [
  "SUBMITTED",
  "ACCEPTED",
  "NOT_SELECTED",
  "EXPIRED",
  "WITHDRAWN",
] as const;

const proposalSchema = z
  .object({
    // Rupees; the server converts to paise for storage.
    price: z.number().int().min(1).max(10_000_000),
    estimatedDurationMinutes: z.number().int().min(1).max(10_080),
    proposedVisitTime: z.string().trim().min(1).max(50),
    diagnosis: z
      .string()
      .trim()
      .min(10, "Diagnosis must be at least 10 characters")
      .max(2000),
    includedServices: z.array(z.string().trim().min(1).max(150)).max(15).optional(),
    excludedServices: z.array(z.string().trim().min(1).max(150)).max(15).optional(),
    notes: z.string().trim().max(1000).optional(),
    validUntil: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

const problemProposalListQuerySchema = z.object({});

// Professional only: submit a proposal. The professional identity always
// comes from the token, never from the body.
router.post(
  "/:problemId/proposals",
  requireAuth,
  requireRole("PROFESSIONAL"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string };
    const problemId = requireProblemId(req);
    const input = parseWith(proposalSchema, req.body) as ProposalInput;

    const proposal = await createProposal(problemId, user.id, input);
    res.status(201).json({ success: true, data: { proposal } });
  }),
);

// Problem owner sees all proposals; professionals see only their own;
// admins see all.
router.get(
  "/:problemId/proposals",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string; role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN" };
    const problemId = requireProblemId(req);
    parseWith(problemProposalListQuerySchema, req.query);

    const result = await listProblemProposals(problemId, { id: user.id, role: user.role });
    res.json({ success: true, data: result });
  }),
);

export default router;
