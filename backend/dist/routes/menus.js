import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authRequired, roleRequired } from "../middleware/auth.js";
import { fetchMenuByDate, fetchMenuHistory, fetchWeekMenus, getWeekStart, saveWeekPlan, startOfDay } from "../services/menuWeek.js";
const router = Router();
const manageRoles = ["admin", "kitchen_manager"];
router.get("/", async (req, res, next) => {
    try {
        const date = req.query.date;
        if (date) {
            return res.json(await fetchMenuByDate(date));
        }
        const menus = await prisma.menu.findMany({
            include: { items: { include: { dish: { include: { category: true } } } } },
            orderBy: { menuDate: "desc" }
        });
        return res.json(menus);
    }
    catch (error) {
        return next(error);
    }
});
router.get("/week", authRequired, roleRequired(manageRoles), async (req, res, next) => {
    try {
        const startDate = req.query.startDate;
        const weekStart = startDate ? startOfDay(new Date(startDate)) : getWeekStart(new Date());
        return res.json(await fetchWeekMenus(weekStart));
    }
    catch (error) {
        return next(error);
    }
});
router.get("/history", authRequired, roleRequired(manageRoles), async (req, res, next) => {
    try {
        const from = req.query.from;
        const to = req.query.to;
        return res.json(await fetchMenuHistory(from, to));
    }
    catch (error) {
        return next(error);
    }
});
const weekPlanSchema = z.object({
    weekStartDate: z.string(),
    days: z.array(z.object({
        date: z.string(),
        meals: z.object({
            BREAKFAST: z.array(z.number().int().positive()),
            LUNCH: z.array(z.number().int().positive()),
            SNACK: z.array(z.number().int().positive())
        })
    }))
});
router.put("/week", authRequired, roleRequired(manageRoles), async (req, res, next) => {
    try {
        const data = weekPlanSchema.parse(req.body);
        const result = await saveWeekPlan(data.weekStartDate, data.days);
        return res.json(result);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0]?.message ?? "Некорректные данные" });
        }
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message });
        }
        return next(error);
    }
});
router.post("/", authRequired, roleRequired(manageRoles), async (req, res, next) => {
    try {
        const { menuDate, items } = req.body;
        const menu = await prisma.menu.create({
            data: {
                menuDate: startOfDay(new Date(menuDate)),
                items: {
                    create: (items ?? []).map((item) => ({
                        dishId: item.dishId,
                        mealType: item.mealType
                    }))
                }
            },
            include: { items: true }
        });
        return res.status(201).json(menu);
    }
    catch (error) {
        return next(error);
    }
});
export default router;
