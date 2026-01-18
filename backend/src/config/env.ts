import { z } from 'zod'
import 'dotenv/config'

const schema = z.object({
    PORT: z.coerce.number().default(4000),

    DATABASE_URL: z.string(),
    FRONTEND_URL: z.string(),

    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),

    QUEUE_NAME: z.string(),
    MIN_DELAY_BETWEEN_EMAILS_MS: z.coerce.number(),
    MAX_EMAILS_PER_HOUR_PER_SENDER: z.coerce.number(),
    WORKER_CONCURRENCY: z.coerce.number(),
    SESSION_SECRET: z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CALLBACK_URL: z.string()


})

export const env = schema.parse(process.env)