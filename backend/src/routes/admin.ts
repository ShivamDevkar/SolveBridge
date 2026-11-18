import { Router } from "express";
import { z } from "zod";
import requireAuth from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";
import { parseWith } from "../utils/validate";
import { ApiError } from "../utils/apiError";
import {
  createCategory,
  decideVerification,
  deleteCategory,
  getPlatformStats,
  listAuditLogs,
  listCategoriesForAdmin,
  listUsersForAdmin,
  listVerificationsForAdmin,
  updateCategory,
  updateUserStatus,
} from "../service/adminService";

const router = Router();

// Every admin endpoint requires an active administrator.
router.use(requireAuth, requireRole("ADMIN"));

function adminId(res: { locals: Record<string, unknown> }): string {
  const user = res.locals.applicationUser as { id: string };
  return user.id;
}

/** Express 5 types route params as `string | string[]`; admin IDs are single. */
function requireParam(value: string | string[] | undefined, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw ApiError.badRequest(`${label} is required`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Dashboard metrics
// ---------------------------------------------------------------------------

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const stats = await getPlatformStats();
    res.json({ success: true, data: { stats } });
  }),
);

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const USER_ROLES = ["CUSTOMER", "PROFESSIONAL", "ADMIN"] as const;
const USER_STATUSES = ["ACTIVE", "SUSPENDED", "BANNED", "DEACTIVATED"] as const;

const userListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  search: z.string().trim().max(100).optional(),
});

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const query = parseWith(userListSchema, req.query);
    const result = await listUsersForAdmin(query);
    res.json({ success: true, data: result });
  }),
);

const userStatusSchema = z.object({
  status: z.enum(USER_STATUSES),
  reason: z.string().trim().max(500).optional(),
});

router.patch(
  "/users/:userId/status",
  asyncHandler(async (req, res) => {
    const input = parseWith(userStatusSchema, req.body);
    const user = await updateUserStatus(
      requireParam(req.params.userId, "userId"),
      adminId(res),
      input,
    );
    res.json({ success: true, data: { user } });
  }),
);

// ---------------------------------------------------------------------------
// Professional verification
// ---------------------------------------------------------------------------

const VERIFICATION_STATUSES = [
  "UNVERIFIED",
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
] as const;

const verificationListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(VERIFICATION_STATUSES).optional(),
});

router.get(
  "/verifications",
  asyncHandler(async (req, res) => {
    const query = parseWith(verificationListSchema, req.query);
    const result = await listVerificationsForAdmin(query);
    res.json({ success: true, data: result });
  }),
);

const decisionSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT", "REQUEST_INFO"]),
  notes: z.string().trim().max(1000).optional(),
});

router.post(
  "/verifications/:professionalId/decision",
  asyncHandler(async (req, res) => {
    const input = parseWith(decisionSchema, req.body);
    const verification = await decideVerification(
      requireParam(req.params.professionalId, "professionalId"),
      adminId(res),
      input,
    );
    res.json({ success: true, data: { verification } });
  }),
);

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await listCategoriesForAdmin();
    res.json({ success: true, data: { categories } });
  }),
);

const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).optional(),
  description: z.string().trim().max(1000).optional(),
});

router.post(
  "/categories",
  asyncHandler(async (req, res) => {
    const input = parseWith(createCategorySchema, req.body);
    const category = await createCategory(adminId(res), input);
    res.status(201).json({ success: true, data: { category } });
  }),
);

const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    slug: z.string().trim().min(2).max(140).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.slug !== undefined ||
      value.description !== undefined ||
      value.isActive !== undefined,
    { message: "Provide at least one field to update" },
  );

router.patch(
  "/categories/:categoryId",
  asyncHandler(async (req, res) => {
    const input = parseWith(updateCategorySchema, req.body);
    const category = await updateCategory(
      requireParam(req.params.categoryId, "categoryId"),
      adminId(res),
      input,
    );
    res.json({ success: true, data: { category } });
  }),
);

router.delete(
  "/categories/:categoryId",
  asyncHandler(async (req, res) => {
    const result = await deleteCategory(
      requireParam(req.params.categoryId, "categoryId"),
      adminId(res),
    );
    res.json({ success: true, data: result });
  }),
);

// ---------------------------------------------------------------------------
// Audit trail
// ---------------------------------------------------------------------------

const auditListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  entityType: z.string().trim().max(100).optional(),
});

router.get(
  "/audit-logs",
  asyncHandler(async (req, res) => {
    const query = parseWith(auditListSchema, req.query);
    const result = await listAuditLogs(query);
    res.json({ success: true, data: result });
  }),
);

export default router;
