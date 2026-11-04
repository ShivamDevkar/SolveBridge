import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import type { Role } from "../../generated/prisma/enums";

export function requireRole(...allowedRoles: Role[]) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const authenticatedUser = res.locals.user as { id?: string } | undefined;

    if (!authenticatedUser?.id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
      return;
    }

    try {
      const applicationUser = await prisma.user.findUnique({
        where: { id: authenticatedUser.id },
        select: { id: true, role: true, status: true },
      });

      if (!applicationUser || applicationUser.status !== "ACTIVE") {
        res.status(403).json({
          success: false,
          message: "Application profile is not active",
          code: "PROFILE_INACTIVE",
        });
        return;
      }

      if (!allowedRoles.includes(applicationUser.role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource",
          code: "ROLE_FORBIDDEN",
        });
        return;
      }

      res.locals.applicationUser = applicationUser;
      next();
    } catch (error) {
      next(error);
    }
  };
}
