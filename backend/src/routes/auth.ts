import { Router, type Request, type Response } from "express";
import { z } from "zod";
import requireAuth from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../config/prisma";

const router = Router();

function getCurrentUser(_req: Request, res: Response) {
  res.json({
    success: true,
    data: {
      user: res.locals.applicationUser,
    },
  });
}

const profileSchema = z.object({
  role: z.enum(["CUSTOMER", "PROFESSIONAL"]).default("CUSTOMER"),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(20).optional(),
  businessName: z.string().trim().max(200).optional(),
  coverageRadius: z.coerce.number().int().min(1).max(100).optional(),
});

async function syncProfile(req: Request, res: Response) {
  const authenticatedUser = res.locals.user as {
    id: string;
    email?: string;
  };
  const profile = profileSchema.parse(req.body);

  const user = await prisma.user.upsert({
    where: { id: authenticatedUser.id },
    create: {
      id: authenticatedUser.id,
      role: profile.role,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      professionalProfile:
        profile.role === "PROFESSIONAL"
          ? {
              create: {
                businessName: profile.businessName,
                serviceRadius: profile.coverageRadius ?? 10,
              },
            }
          : undefined,
    },
    update: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      ...(profile.role === "PROFESSIONAL"
        ? {
            professionalProfile: {
              upsert: {
                create: {
                  businessName: profile.businessName,
                  serviceRadius: profile.coverageRadius ?? 10,
                },
                update: {
                  businessName: profile.businessName,
                  serviceRadius: profile.coverageRadius,
                },
              },
            },
          }
        : {}),
    },
    include: { professionalProfile: true },
  });

  res.status(200).json({
    success: true,
    data: {
      user,
      email: authenticatedUser.email ?? null,
    },
  });
}

router.get(
  "/me",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  getCurrentUser,
);
router.post("/sync", requireAuth, (req, res, next) => {
  void syncProfile(req, res).catch(next);
});

export default router;
