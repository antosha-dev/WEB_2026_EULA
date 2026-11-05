import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const TOP_100_PASSWORDS = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111", "1234567", "dragon",
  "123123", "baseball", "abc123", "football", "monkey", "letmein", "696969", "shadow", "master", "666666",
  "qwertyuiop", "123321", "mustang", "1234567890", "michael", "password1", "sunshine", "admin", "welcome",
  "senior", "jordan", "superman", "iloveyou", "amanda", "ashley", "bailey", "passw0rd", "secret", "123qwe",
  "zxcvbn", "11111111", "1q2w3e4r", "pass", "123abc", "aaaaaa", "qazwsx", "trustno1", "hello", "charlie",
  "1qaz2wsx", "password123", "abcd1234", "112233", "passw0rd1", "test", "123456a", "abc123456", "qwerty123",
  "123456789a", "letmein1", "welcome1", "admin123", "password12", "qwerty1", "12345678910", "12345678911",
  "football1", "monkey1", "12345678912", "baseball1", "iloveyou1", "sunshine1", "master1", "hello1", "dragon1"
]);

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Пароль должен содержать минимум 8 символов");
  if (!/[a-z]/.test(password)) errors.push("Пароль должен содержать хотя бы одну строчную букву");
  if (!/[A-Z]/.test(password)) errors.push("Пароль должен содержать хотя бы одну заглавную букву");
  if (!/[0-9]/.test(password)) errors.push("Пароль должен содержать хотя бы одну цифру");
  if (TOP_100_PASSWORDS.has(password.toLowerCase())) errors.push("Этот пароль слишком распространен, выберите другой");
  return errors;
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).refine((p) => validatePassword(p).length === 0, { message: "Пароль не соответствует требованиям" }),
  fullName: z.string().min(2),
  classNumber: z.string().min(1).optional()
});

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);
    const role = await prisma.role.upsert({
      where: { name: "student" },
      update: {},
      create: { name: "student" }
    });

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        roleId: role.id,
        student: data.classNumber
          ? { create: { classNumber: data.classNumber, allergies: null } }
          : undefined
      },
      include: { role: true }
    });

    const token = jwt.sign({ id: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: "1d" });
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name }
    });
  } catch (error) {
    return next(error);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: "1d" });
    return res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name }
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (_req, res) => {
  return res.json({ message: "Logged out" });
});

router.get("/me", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let payload: { id: number; role: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { role: true, student: true }
    });
    if (!user) return res.status(401).json({ message: "User not found" });

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      student: user.student
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
