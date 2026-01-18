import { prisma } from "../db/prisma";
import { emailQueue } from "../queues/email.queue";

export async function scheduleSingleEmail(input: {
  senderId: string;
  to: string;
  subject: string;
  body: string;
  sendAt: Date;
  hourlyLimit?: number;
}) {
  const email = await prisma.scheduledEmail.create({
    data: {
      senderId: input.senderId,
      to: input.to,
      subject: input.subject,
      body: input.body,
      sendAt: input.sendAt,
      status: "SCHEDULED"
    }
  });

  const delay = Math.max(0, input.sendAt.getTime() - Date.now());

  await emailQueue.add(
    "send-email",
    { emailId: email.id, hourlyLimit: input.hourlyLimit },
    { jobId: email.id, delay }
  );

  return email;
}

export async function bulkScheduleEmails(input: {
  senderId: string;
  subject: string;
  body: string;
  startAt: Date;
  delayBetweenMs: number;
  hourlyLimit: number;
  leads: string[];
}) {
  const created: string[] = [];

  // create sequential send times
  for (let i = 0; i < input.leads.length; i++) {
    const sendAt = new Date(input.startAt.getTime() + i * input.delayBetweenMs);

    const email = await scheduleSingleEmail({
      senderId: input.senderId,
      to: input.leads[i],
      subject: input.subject,
      body: input.body,
      sendAt,
      hourlyLimit: input.hourlyLimit
    });

    created.push(email.id);
  }

  return created;
}
