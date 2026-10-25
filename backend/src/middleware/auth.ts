import type { NextFunction, Request, Response } from "express";
import getAuthenticatedUser from "../service/supabaseAuth";

async function requireAuth(req: Request, res: Response, next:NextFunction) {
    const authorization = req.headers.authorization;

    if(!authorization?.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });

        return;
    }

    try {
        const token = authorization.slice("Bearer ".length).trim();
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });

            return;
        }

        const user = await getAuthenticatedUser(token);

        res.locals.user = user;
        next();
    } catch {
        res.status(401).json({
            success: false, 
            message: "Invalid or expired access token",
        });
    }
}

export default requireAuth;