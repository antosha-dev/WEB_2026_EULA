import { Router } from "express";
import { prisma } from "../prisma.js";
import { authRequired, roleRequired } from "../middleware/auth.js";
const router = Router();
const allowedRoles = ["admin", "kitchen_manager"];
router.use(authRequired, roleRequired(allowedRoles));
router.get("/", async (req, res, next) => {
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId: req.user.id },
            include: { dish: { include: { category: true } } }
        });
        return res.json(favorites);
    }
    catch (error) {
        return next(error);
    }
});
router.post("/:dishId", async (req, res, next) => {
    try {
        const dishId = Number(req.params.dishId);
        if (!Number.isInteger(dishId) || dishId <= 0) {
            return res.status(400).json({ message: "Некорректный id блюда" });
        }
        const dish = await prisma.dish.findUnique({ where: { id: dishId } });
        if (!dish) {
            return res.status(404).json({ message: "Блюдо не найдено. Обновите страницу." });
        }
        const favorite = await prisma.favorite.upsert({
            where: { userId_dishId: { userId: req.user.id, dishId } },
            update: {},
            create: { userId: req.user.id, dishId },
            include: { dish: { include: { category: true } } }
        });
        return res.status(201).json(favorite);
    }
    catch (error) {
        return next(error);
    }
});
router.delete("/:dishId", async (req, res, next) => {
    try {
        const dishId = Number(req.params.dishId);
        if (!Number.isInteger(dishId) || dishId <= 0) {
            return res.status(400).json({ message: "Некорректный id блюда" });
        }
        await prisma.favorite.deleteMany({
            where: { userId: req.user.id, dishId }
        });
        return res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
export default router;
