import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../db/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerLocal(req: Request, res: Response) {
  const parsed = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  const passwordHash = await bcrypt.hash(parsed.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      provider: "LOCAL",
      passwordHash,
      avatar: null,
    },
  });

  // set session login
  (req as any).login(user, (err: any) => {
    if (err) return res.status(500).json({ success: false, message: "Login failed" });
    return res.json({ success: true, user });
  });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginLocal(req: Request, res: Response) {
  const parsed = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (!user || !user.passwordHash) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(parsed.password, user.passwordHash);
  if (!ok) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }

  (req as any).login(user, (err: any) => {
    if (err) return res.status(500).json({ success: false, message: "Login failed" });
    return res.json({ success: true, user });
  });
}
