import { Router } from "express";
import { z } from "zod";
import requireAuth from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { parseWith } from "../utils/validate";
import { ApiError } from "../utils/apiError";
import { isUuid } from "../utils/isUuid";

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

// List the authenticated user's notifications, newest first.
router.get(
  "/",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN", "MODERATOR"),
  asyncHandler(async (req, res) => {
    const user = res.locals.user as { id: string };
    const query = parseWith(listQuerySchema, req.query);

    const where = {
      userId: user.id,
      ...(query.unreadOnly ? { isRead: false } : {}),
    };

    const [notifications, total, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          linkUrl: true,
          isRead: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where: { userId: user.id } }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      },
    });
  }),
);

// Mark one of the user's own notifications as read. Idempotent; other users'
// notifications return 404 so their existence is not leaked.
router.post(
  "/:notificationId/read",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN", "MODERATOR"),
  asyncHandler(async (req, res) => {
    const user = res.locals.user as { id: string };
    const { notificationId } = req.params as { notificationId: string };

    if (!isUuid(notificationId)) {
      throw ApiError.badRequest("notificationId must be a valid UUID");
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true, isRead: true },
    });

    if (!notification || notification.userId !== user.id) {
      throw ApiError.notFound("Notification not found");
    }

    if (!notification.isRead) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    }

    res.json({ success: true, data: { id: notificationId, isRead: true } });
  }),
);

// Mark all of the user's notifications as read.
router.post(
  "/read-all",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN", "MODERATOR"),
  asyncHandler(async (_req, res) => {
    const user = res.locals.user as { id: string };

    const result = await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: { updated: result.count },
    });
  }),
);

export default router;
