import { Router, type Request, type Response } from "express";
import requireAuth from "../middleware/auth";

const router = Router();

function getCurrentUser(req: Request, res: Response) {
    res.json({
        success: true, 
        data: {
            user: res.locals.user, 
        },
    });
}

router.get("/me", requireAuth, getCurrentUser);
router.get("/", requireAuth, getCurrentUser);

export default router;