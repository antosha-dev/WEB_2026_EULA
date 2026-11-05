import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  classNumber: z.string().min(1).optional(),
  allergies: z.string().nullable().optional()
});

function formatUserResponse(user: {
  id: number;
  email: string;
  fullName: string;
  role: { name: string };
  student: { classNumber: string; allergies: string | null } | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role.name,
    createdAt: user.createdAt,
    student: user.student
  };
}

router.get("/me", authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { role: true, student: true }
    });
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    return res.json(formatUserResponse(user));
  } catch (error) {
    return next(error);
  }
});

router.patch("/me", authRequired, async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const userId = req.user!.id;

    const current = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, student: true }
    });
    if (!current) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (data.email && data.email !== current.email) {
      const exists = await prisma.user.findUnique({ where: { email: data.email } });
      if (exists) {
        return res.status(409).json({ message: "Этот email уже занят" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.email ? { email: data.email } : {}),
        ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {})
      },
      include: { role: true, student: true }
    });

    if (current.role.name === "student") {
      if (current.student) {
        await prisma.student.update({
          where: { userId },
          data: {
            ...(data.classNumber !== undefined ? { classNumber: data.classNumber } : {}),
            ...(data.allergies !== undefined ? { allergies: data.allergies } : {})
          }
        });
      } else if (data.classNumber) {
        await prisma.student.create({
          data: {
            userId,
            classNumber: data.classNumber,
            allergies: data.allergies ?? null
          }
        });
      }
    }

    const fresh = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, student: true }
    });

    return res.json(formatUserResponse(fresh!));
  } catch (error) {
    return next(error);
  }
});

export default router;
