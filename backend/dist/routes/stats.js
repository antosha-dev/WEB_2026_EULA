import { Router } from "express";
import { getDashboardStats } from "../services/stats.js";
const router = Router();
router.get("/", async (_req, res, next) => {
    try {
        return res.json(await getDashboardStats());
    }
    catch (error) {
        return next(error);
    }
});
export default router;
