import { Router } from "express";
import { z } from "zod";
import requireAuth from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { parseWith } from "../utils/validate";
import { ApiError } from "../utils/apiError";
import { isUuid } from "../utils/isUuid";
import {
  getProposalForViewer,
  listProfessionalProposals,
  withdrawProposal,
} from "../service/proposalService";
import { acceptProposal } from "../service/jobService";

const router = Router();

const PROPOSAL_STATUSES = [
  "SUBMITTED",
  "ACCEPTED",
  "NOT_SELECTED",
  "EXPIRED",
  "WITHDRAWN",
] as const;

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(PROPOSAL_STATUSES).optional(),
});

// The authenticated professional's own proposals, with problem summaries.
router.get(
  "/",
  requireAuth,
  requireRole("PROFESSIONAL"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string };
    const query = parseWith(listQuerySchema, req.query);

    const result = await listProfessionalProposals(user.id, query);
    res.json({ success: true, data: result });
  }),
);

function requireProposalId(value: unknown): string {
  if (typeof value !== "string" || !isUuid(value)) {
    throw ApiError.badRequest("proposalId must be a valid UUID");
  }
  return value;
}

// Single proposal: problem owner, the bidding professional, or admin.
router.get(
  "/:proposalId",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as {
      id: string;
      role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
    };
    const proposalId = requireProposalId(req.params.proposalId);

    const proposal = await getProposalForViewer(proposalId, { id: user.id, role: user.role });
    res.json({ success: true, data: { proposal } });
  }),
);

// Customer only: accept a submitted proposal -> creates the job.
router.post(
  "/:proposalId/accept",
  requireAuth,
  requireRole("CUSTOMER"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string };
    const proposalId = requireProposalId(req.params.proposalId);

    const job = await acceptProposal(proposalId, user.id);
    res.status(201).json({ success: true, data: { job } });
  }),
);

// Professional only: withdraw a submitted proposal.
router.post(
  "/:proposalId/withdraw",
  requireAuth,
  requireRole("PROFESSIONAL"),
  asyncHandler(async (req, res) => {
    const user = res.locals.applicationUser as { id: string };
    const proposalId = requireProposalId(req.params.proposalId);

    const proposal = await withdrawProposal(proposalId, user.id);
    res.json({ success: true, data: { proposal } });
  }),
);

export default router;
