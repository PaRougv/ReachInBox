import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { prisma } from "../db/prisma";

export async function createEtherealSender(req: Request, res: Response) {
  const testAccount = await nodemailer.createTestAccount();

  const sender = await prisma.emailSender.create({
    data: {
      name: req.body?.name ?? "Ethereal Sender",
      email: testAccount.user,
      smtpHost: testAccount.smtp.host,
      smtpPort: testAccount.smtp.port,
      smtpUser: testAccount.user,
      smtpPass: testAccount.pass
    }
  });

  res.json({ success: true, sender });
}

export async function listSenders(req: Request, res: Response) {
  const senders = await prisma.emailSender.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, senders });
}
