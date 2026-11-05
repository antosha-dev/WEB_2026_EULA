import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authRequired, roleRequired } from "../middleware/auth.js";
const router = Router();
router.get("/", async (req, res, next) => {
    try {
        const { q, categoryId, sortBy = "name" } = req.query;
        const dishes = await prisma.dish.findMany({
            where: {
                ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
                ...(categoryId ? { categoryId: Number(categoryId) } : {})
            },
            orderBy: sortBy === "price" ? { price: "asc" } : sortBy === "calories" ? { calories: "asc" } : { name: "asc" },
            include: { category: true }
        });
        return res.json(dishes);
    }
    catch (error) {
        return next(error);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const dish = await prisma.dish.findUnique({ where: { id: Number(req.params.id) }, include: { category: true } });
        if (!dish) {
            return res.status(404).json({ message: "Dish not found" });
        }
        return res.json(dish);
    }
    catch (error) {
        return next(error);
    }
});
const dishSchema = z.object({
    name: z.string().min(2),
    description: z.string().min(2),
    price: z.number().positive(),
    calories: z.number().int().positive(),
    allergens: z.string().optional(),
    imageUrl: z.string().url().optional(),
    categoryId: z.number().int().positive()
});
router.post("/", authRequired, roleRequired(["admin"]), async (req, res, next) => {
    try {
        const data = dishSchema.parse(req.body);
        const dish = await prisma.dish.create({ data: { ...data, price: data.price.toString() } });
        return res.status(201).json(dish);
    }
    catch (error) {
        return next(error);
    }
});
router.put("/:id", authRequired, roleRequired(["admin"]), async (req, res, next) => {
    try {
        const data = dishSchema.partial().parse(req.body);
        const dish = await prisma.dish.update({
            where: { id: Number(req.params.id) },
            data: { ...data, ...(data.price ? { price: data.price.toString() } : {}) }
        });
        return res.json(dish);
    }
    catch (error) {
        return next(error);
    }
});
router.delete("/:id", authRequired, roleRequired(["admin"]), async (req, res, next) => {
    try {
        await prisma.dish.delete({ where: { id: Number(req.params.id) } });
        return res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
export default router;
