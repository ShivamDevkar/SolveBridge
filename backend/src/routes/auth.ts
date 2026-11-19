import { Router, type Request, type Response } from "express";
import { z } from "zod";
import requireAuth from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { parseWith } from "../utils/validate";
import { ApiError } from "../utils/apiError";

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
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  phone: z.string().trim().min(1).max(20).optional(),
  businessName: z.string().trim().max(200).optional(),
  category: z.string().trim().max(140).optional(),
  skills: z.array(z.string().trim().min(1).max(120)).optional(),
  coverageRadius: z.coerce.number().int().min(1).max(100).optional(),
});

const syncProfile = asyncHandler(async (req, res) => {
  const authenticatedUser = res.locals.user as {
    id: string;
    email?: string;
  };
  const profile = parseWith(profileSchema, req.body);
  const normalizedFirstName =
    profile.firstName?.trim() ||
    (profile.role === "PROFESSIONAL" ? profile.businessName?.trim() : "") ||
    "User";
  const normalizedLastName =
    profile.lastName?.trim() ||
    (profile.role === "PROFESSIONAL" ? "Professional" : "");

  let user;
  try {
    user = await prisma.$transaction(async (tx) => {
      const synchronizedUser = await tx.user.upsert({
        where: { id: authenticatedUser.id },
        create: {
          id: authenticatedUser.id,
          role: profile.role,
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
          phone: profile.phone,
        },
        update: {
          role: profile.role,
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
          phone: profile.phone,
        },
      });

      if (profile.role === "PROFESSIONAL") {
        const professionalProfile = await tx.professionalProfile.upsert({
          where: { userId: synchronizedUser.id },
          create: {
            userId: synchronizedUser.id,
            businessName: profile.businessName,
            serviceRadius: profile.coverageRadius ?? 10,
          },
          update: {
            businessName: profile.businessName,
            serviceRadius: profile.coverageRadius ?? 10,
          },
        });

        if (profile.category && profile.skills && profile.skills.length > 0) {
          const categorySlugByName: Record<string, string> = {
            "Home Appliances & HVAC": "appliance-repair",
            "Plumbing & Water Systems": "plumbing",
            "Electrical Systems": "electrical",
            "Vehicle & Roadside Breakdown": "vehicle-roadside",
            "Tech Hardware & Networking": "computer-network",
            "Commercial Facility Maintenance": "commercial-facility",
            "General Diagnosis": "general-diagnosis",
          };
          const resolvedSlug =
            categorySlugByName[profile.category] ??
            profile.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          const category = await tx.serviceCategory.findFirst({
            where: {
              OR: [
                { name: profile.category },
                { slug: resolvedSlug },
              ],
              isActive: true,
            },
          });

          if (category) {
            const skills = await Promise.all(
              [...new Set(profile.skills)].map(async (skillName) => {
                const skill = await tx.skill.findFirst({
                  where: { categoryId: category.id, name: skillName },
                });
                if (skill) return skill;

                return tx.skill.create({
                  data: { categoryId: category.id, name: skillName },
                });
              }),
            );

            await tx.professionalSkill.deleteMany({
              where: { professionalId: professionalProfile.id },
            });
            await tx.professionalSkill.createMany({
              data: skills.map((skill) => ({
                professionalId: professionalProfile.id,
                skillId: skill.id,
              })),
              skipDuplicates: true,
            });
          }
        }
      }

      return tx.user.findUnique({
        where: { id: synchronizedUser.id },
        include: { professionalProfile: true },
      });
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw ApiError.conflict("This phone number is already registered to another account.");
    }
    throw error;
  }

  res.status(200).json({
    success: true,
    data: {
      user,
      email: authenticatedUser.email ?? null,
    },
  });
});

router.get(
  "/me",
  requireAuth,
  requireRole("CUSTOMER", "PROFESSIONAL", "ADMIN"),
  getCurrentUser,
);
router.post("/sync", requireAuth, syncProfile);

export default router;
