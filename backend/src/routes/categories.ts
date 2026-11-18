import { Router } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Public: category browsing is needed for the problem wizard and professional
// profile, which must also work for users who are not signed in yet.
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        skills: {
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
        _count: { select: { problems: true } },
      },
    });

    res.json({
      success: true,
      data: { categories },
    });
  }),
);

export default router;
