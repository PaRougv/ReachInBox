import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.user) return next();
  return res.status(401).json({ success: false, message: "Unauthorized" });
}
