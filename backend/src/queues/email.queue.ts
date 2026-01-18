import { Queue } from "bullmq";
import { env } from "../config/env";

export const emailQueue = new Queue(env.QUEUE_NAME, {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  defaultJobOptions: {
    removeOnComplete: 2000,
    removeOnFail: 5000,
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
  },
});
