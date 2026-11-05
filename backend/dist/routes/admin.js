import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authRequired, roleRequired } from "../middleware/auth.js";
const router = Router();
router.use(authRequired, roleRequired(["admin"]));
// Roles
router.get("/roles", async (_req, res, next) => {
    try {
        return res.json(await prisma.role.findMany({ include: { _count: { select: { users: true } } } }));
    }
    catch (e) {
        return next(e);
    }
});
router.post("/roles", async (req, res, next) => {
    try {
        const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
        return res.status(201).json(await prisma.role.create({ data: { name } }));
    }
    catch (e) {
        return next(e);
    }
});
router.put("/roles/:id", async (req, res, next) => {
    try {
        const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
        return res.json(await prisma.role.update({ where: { id: Number(req.params.id) }, data: { name } }));
    }
    catch (e) {
        return next(e);
    }
});
router.delete("/roles/:id", async (req, res, next) => {
    try {
        await prisma.role.delete({ where: { id: Number(req.params.id) } });
        return res.status(204).send();
    }
    catch (e) {
        return next(e);
    }
});
// Users
router.get("/users", async (_req, res, next) => {
    try {
        return res.json(await prisma.user.findMany({
            include: { role: true, student: true },
            orderBy: { id: "asc" }
        }));
    }
    catch (e) {
        return next(e);
    }
});
router.post("/users", async (req, res, next) => {
    try {
        const data = z
            .object({
            email: z.string().email(),
            password: z.string().min(6),
            fullName: z.string().min(2),
            roleId: z.number().int().positive()
        })
            .parse(req.body);
        const user = await prisma.user.create({
            data: {
                email: data.email,
                fullName: data.fullName,
                roleId: data.roleId,
                passwordHash: await bcrypt.hash(data.password, 10)
            },
            include: { role: true }
        });
        return res.status(201).json(user);
    }
    catch (e) {
        return next(e);
    }
});
router.put("/users/:id", async (req, res, next) => {
    try {
        const data = z
            .object({
            email: z.string().email().optional(),
            password: z.string().min(6).optional(),
            fullName: z.string().min(2).optional(),
            roleId: z.number().int().positive().optional()
        })
            .parse(req.body);
        const user = await prisma.user.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(data.email ? { email: data.email } : {}),
                ...(data.fullName ? { fullName: data.fullName } : {}),
                ...(data.roleId ? { roleId: data.roleId } : {}),
                ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {})
            },
            include: { role: true }
        });
        return res.json(user);
    }
    catch (e) {
        return next(e);
    }
});
router.delete("/users/:id", async (req, res, next) => {
    try {
        await prisma.user.delete({ where: { id: Number(req.params.id) } });
        return res.status(204).send();
    }
    catch (e) {
        return next(e);
    }
});
// Students
router.get("/students", async (_req, res, next) => {
    try {
        return res.json(await prisma.student.findMany({ include: { user: true } }));
    }
    catch (e) {
        return next(e);
    }
});
router.post("/students", async (req, res, next) => {
    try {
        const data = z
            .object({
            userId: z.number().int().positive(),
            classNumber: z.string().min(1),
            allergies: z.string().optional()
        })
            .parse(req.body);
        return res.status(201).json(await prisma.student.create({ data }));
    }
    catch (e) {
        return next(e);
    }
});
router.put("/students/:id", async (req, res, next) => {
    try {
        const data = z
            .object({
            classNumber: z.string().min(1).optional(),
            allergies: z.string().nullable().optional()
        })
            .parse(req.body);
        return res.json(await prisma.student.update({ where: { id: Number(req.params.id) }, data }));
    }
    catch (e) {
        return next(e);
    }
});
router.delete("/students/:id", async (req, res, next) => {
    try {
        await prisma.student.delete({ where: { id: Number(req.params.id) } });
        return res.status(204).send();
    }
    catch (e) {
        return next(e);
    }
});
// Categories
router.get("/categories", async (_req, res, next) => {
    try {
        return res.json(await prisma.category.findMany({ orderBy: { id: "asc" } }));
    }
    catch (e) {
        return next(e);
    }
});
router.post("/categories", async (req, res, next) => {
    try {
        const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
        return res.status(201).json(await prisma.category.create({ data: { name } }));
    }
    catch (e) {
        return next(e);
    }
});
router.put("/categories/:id", async (req, res, next) => {
    try {
        const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
        return res.json(await prisma.category.update({ where: { id: Number(req.params.id) }, data: { name } }));
    }
    catch (e) {
        return next(e);
    }
});
router.delete("/categories/:id", async (req, res, next) => {
    try {
        await prisma.category.delete({ where: { id: Number(req.params.id) } });
        return res.status(204).send();
    }
    catch (e) {
        return next(e);
    }
});
// Dishes
router.get("/dishes", async (_req, res, next) => {
    try {
        return res.json(await prisma.dish.findMany({ include: { category: true }, orderBy: { id: "asc" } }));
    }
    catch (e) {
        return next(e);
    }
});
router.post("/dishes", async (req, res, next) => {
    try {
        const data = z
            .object({
            name: z.string().min(2),
            description: z.string().min(2),
            price: z.number().positive(),
            calories: z.number().int().positive(),
            allergens: z.string().optional(),
            imageUrl: z.string().url().optional(),
            categoryId: z.number().int().positive()
        })
            .parse(req.body);
        return res.status(201).json(await prisma.dish.create({
            data: { ...data, price: data.price.toString() },
            include: { category: true }
        }));
    }
    catch (e) {
        return next(e);
    }
});
router.put("/dishes/:id", async (req, res, next) => {
    try {
        const data = z
            .object({
            name: z.string().min(2).optional(),
            description: z.string().min(2).optional(),
            price: z.number().positive().optional(),
            calories: z.number().int().positive().optional(),
            allergens: z.string().nullable().optional(),
            imageUrl: z.string().url().nullable().optional(),
            categoryId: z.number().int().positive().optional()
        })
            .parse(req.body);
        return res.json(await prisma.dish.update({
            where: { id: Number(req.params.id) },
            data: { ...data, ...(data.price !== undefined ? { price: data.price.toString() } : {}) },
            include: { category: true }
        }));
    }
    catch (e) {
        return next(e);
    }
});
router.delete("/dishes/:id", async (req, res, next) => {
    try {
        await prisma.dish.delete({ where: { id: Number(req.params.id) } });
        return res.status(204).send();
    }
    catch (e) {
        return next(e);
    }
});
// Menus
router.get("/menus", async (_req, res, next) => {
    try {
        return res.json(await prisma.menu.findMany({ include: { items: { include: { dish: true } } }, orderBy: { menuDate: "desc" } }));
    }
    catch (e) {
        return next(e);
    }
});
router.post("/menus", async (req, res, next) => {
    try {
        const { menuDate } = z.object({ menuDate: z.string() }).parse(req.body);
        return res.status(201).json(await prisma.menu.create({ data: { menuDate: new Date(menuDate) } }));
    }
    catch (e) {
        return next(e);
    }
});
router.put("/menus/:id", async (req, res, next) => {
    try {
        const { menuDate } = z.object({ menuDate: z.string() }).parse(req.body);
        return res.json(await prisma.menu.update({ where: { id: Number(req.params.id) }, data: { menuDate: new Date(menuDate) } }));
    }
    catch (e) {
        return next(e);
    }
});
router.delete("/menus/:id", async (req, res, next) => {
    try {
        await prisma.menu.delete({ where: { id: Number(req.params.id) } });
        return res.status(204).send();
    }
    catch (e) {
        return next(e);
    }
});
// Menu items
router.get("/menu-items", async (_req, res, next) => {
    try {
        return res.json(await prisma.menuItem.findMany({ include: { menu: true, dish: true }, orderBy: { id: "asc" } }));
    }
    catch (e) {
        return next(e);
    }
});
router.post("/menu-items", async (req, res, next) => {
    try {
        const data = z
            .object({
            menuId: z.number().int().positive(),
            dishId: z.number().int().positive(),
            mealType: z.enum(["BREAKFAST", "LUNCH", "SNACK"]),
            isActive: z.boolean().optional()
        })
            .parse(req.body);
        return res.status(201).json(await prisma.menuItem.create({ data }));
    }
    catch (e) {
        return next(e);
    }
});
router.put("/menu-items/:id", async (req, res, next) => {
    try {
        const data = z
            .object({
            menuId: z.number().int().positive().optional(),
            dishId: z.number().int().positive().optional(),
            mealType: z.enum(["BREAKFAST", "LUNCH", "SNACK"]).optional(),
            isActive: z.boolean().optional()
        })
            .parse(req.body);
        return res.json(await prisma.menuItem.update({ where: { id: Number(req.params.id) }, data }));
    }
    catch (e) {
        return next(e);
    }
});
router.delete("/menu-items/:id", async (req, res, next) => {
    try {
        await prisma.menuItem.delete({ where: { id: Number(req.params.id) } });
        return res.status(204).send();
    }
    catch (e) {
        return next(e);
    }
});
// Favorites
router.get("/favorites", async (_req, res, next) => {
    try {
        return res.json(await prisma.favorite.findMany({ include: { user: true, dish: true }, orderBy: { id: "asc" } }));
    }
    catch (e) {
        return next(e);
    }
});
router.post("/favorites", async (req, res, next) => {
    try {
        const data = z
            .object({ userId: z.number().int().positive(), dishId: z.number().int().positive() })
            .parse(req.body);
        return res.status(201).json(await prisma.favorite.create({ data }));
    }
    catch (e) {
        return next(e);
    }
});
router.put("/favorites/:id", async (req, res, next) => {
    try {
        const data = z
            .object({
            userId: z.number().int().positive().optional(),
            dishId: z.number().int().positive().optional()
        })
            .parse(req.body);
        return res.json(await prisma.favorite.update({ where: { id: Number(req.params.id) }, data }));
    }
    catch (e) {
        return next(e);
    }
});
router.delete("/favorites/:id", async (req, res, next) => {
    try {
        await prisma.favorite.delete({ where: { id: Number(req.params.id) } });
        return res.status(204).send();
    }
    catch (e) {
        return next(e);
    }
});
export default router;
