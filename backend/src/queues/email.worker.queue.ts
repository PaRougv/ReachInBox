import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { prisma } from "../db/prisma";
import { checkHourlyLimit } from "../services/ratelimit.service";
import { sendMailSMTP } from "../services/smtp.service";

export const emailWorker = new Worker(
  env.QUEUE_NAME,
  async (job) => {
    const { emailId, hourlyLimit } = job.data as { emailId: string; hourlyLimit?: number };

    const email = await prisma.scheduledEmail.findUnique({
      where: { id: emailId },
      include: { sender: true }
    });

    if (!email) return;

    // idempotency
    if (email.status === "SENT") return;

    // per-sender rate limit (redis atomic)
    const limitResult = await checkHourlyLimit(email.senderId, hourlyLimit);
    if (!limitResult.allowed) {
      await job.moveToDelayed(Date.now() + limitResult.retryAfterMs);
      return;
    }

    await prisma.scheduledEmail.update({
      where: { id: emailId },
      data: { status: "PROCESSING" }
    });

    try {
      const { info, previewUrl } = await sendMailSMTP({
        host: email.sender.smtpHost,
        port: email.sender.smtpPort,
        user: email.sender.smtpUser,
        pass: email.sender.smtpPass,
        fromEmail: email.sender.email,
        to: email.to,
        subject: email.subject,
        body: email.body
      });

      await prisma.scheduledEmail.update({
        where: { id: emailId },
        data: {
          status: "SENT",
          messageId: info.messageId,
          previewUrl: previewUrl ?? null,
          sentAt: new Date(),
          error: null
        }
      });
    } catch (err: any) {
      await prisma.scheduledEmail.update({
        where: { id: emailId },
        data: {
          status: "FAILED",
          error: String(err?.message || err),
          attempts: { increment: 1 }
        }
      });
      throw err;
    }
  },
  {
    connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
    concurrency: env.WORKER_CONCURRENCY,

    // minimum delay between emails globally
    limiter: {
      max: 1,
      duration: env.MIN_DELAY_BETWEEN_EMAILS_MS
    }
  }
);
