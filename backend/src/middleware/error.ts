import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  try {
    console.error(String(err));
  } catch {
    console.error("Unknown error");
  }

  if (err instanceof ZodError) {
    const message = err.errors[0]?.message ?? "Некорректные данные";
    return res.status(400).json({ message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Запись с такими данными уже существует" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({
        message: "Связанная запись не найдена. Перезайдите в аккаунт и обновите страницу."
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Запись не найдена" });
    }
  }

  const msg = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({ message: msg });
}
