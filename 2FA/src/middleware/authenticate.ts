import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayloadCustom {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing auth header" });

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayloadCustom;
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
