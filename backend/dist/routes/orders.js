import { Router } from "express";
import { prisma } from "../prisma.js";
import { authRequired, roleRequired } from "../middleware/auth.js";
const router = Router();
router.get("/", authRequired, async (req, res, next) => {
    try {
        const isAdmin = req.user?.role === "admin";
        const orders = await prisma.order.findMany({
            where: isAdmin ? {} : { userId: req.user?.id },
            include: { items: { include: { dish: true } }, user: true },
            orderBy: { createdAt: "desc" }
        });
        return res.json(orders);
    }
    catch (error) {
        return next(error);
    }
});
router.post("/", authRequired, async (req, res, next) => {
    try {
        const { items, preOrderDate } = req.body;
        const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                preOrderDate: new Date(preOrderDate),
                totalPrice: totalPrice.toString(),
                items: {
                    create: items.map((item) => ({
                        dishId: item.dishId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice.toString()
                    }))
                }
            },
            include: { items: true }
        });
        return res.status(201).json(order);
    }
    catch (error) {
        return next(error);
    }
});
router.patch("/:id/status", authRequired, roleRequired(["admin"]), async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await prisma.order.update({
            where: { id: Number(req.params.id) },
            data: { status }
        });
        return res.json(order);
    }
    catch (error) {
        return next(error);
    }
});
router.delete("/:id", authRequired, async (req, res, next) => {
    try {
        const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.userId !== req.user?.id && req.user?.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }
        await prisma.order.delete({ where: { id: order.id } });
        return res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
export default router;
