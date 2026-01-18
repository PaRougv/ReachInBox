import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { bulkScheduleEmails, scheduleSingleEmail } from "../services/email.service";

const scheduleSchema = z.object({
  senderId: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  sendAt: z.string().datetime()
});

export async function scheduleEmailController(req: Request, res: Response) {
  const parsed = scheduleSchema.parse(req.body);

  const email = await scheduleSingleEmail({
    senderId: parsed.senderId,
    to: parsed.to,
    subject: parsed.subject,
    body: parsed.body,
    sendAt: new Date(parsed.sendAt)
  });

  res.json({ success: true, email });
}

const bulkSchema = z.object({
  senderId: z.string().uuid(),
  subject: z.string().min(1),
  body: z.string().min(1),
  startAt: z.string().datetime(),
  delayBetweenMs: z.number().int().min(0),
  hourlyLimit: z.number().int().min(1),
  leads: z.array(z.string().email()).min(1)
});

export async function bulkScheduleController(req: Request, res: Response) {
  const parsed = bulkSchema.parse(req.body);

  const ids = await bulkScheduleEmails({
    senderId: parsed.senderId,
    subject: parsed.subject,
    body: parsed.body,
    startAt: new Date(parsed.startAt),
    delayBetweenMs: parsed.delayBetweenMs,
    hourlyLimit: parsed.hourlyLimit,
    leads: parsed.leads
  });

  res.json({ success: true, scheduledCount: ids.length, ids });
}

export async function getScheduledEmails(req: Request, res: Response) {
  const emails = await prisma.scheduledEmail.findMany({
    where: { status: "SCHEDULED" },
    orderBy: { sendAt: "asc" }
  });
  res.json({ success: true, emails });
}

export async function getSentEmails(req: Request, res: Response) {
  const emails = await prisma.scheduledEmail.findMany({
    where: { status: { in: ["SENT", "FAILED"] } },
    orderBy: { sentAt: "desc" }
  });
  res.json({ success: true, emails });
}
