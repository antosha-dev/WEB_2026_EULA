import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let payload: { id: number; role: string };
  try {
    payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  prisma.user
    .findUnique({ where: { id: payload.id }, include: { role: true } })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Сессия устарела. Войдите снова." });
      }
      req.user = { id: user.id, role: user.role.name };
      next();
    })
    .catch((err) => next(err));
}

export function roleRequired(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}
