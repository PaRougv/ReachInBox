import { redis } from "../config/redis";
import { env } from "../config/env";

function hourKey(date = new Date()) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}`;
}

function msUntilNextHour(date = new Date()) {
  const next = new Date(date);
  next.setUTCMinutes(0, 0, 0);
  next.setUTCHours(next.getUTCHours() + 1);
  return next.getTime() - date.getTime();
}

export async function checkHourlyLimit(senderId: string, limitOverride?: number) {
  const limit = limitOverride ?? env.MAX_EMAILS_PER_HOUR_PER_SENDER;

  const key = `rate:${senderId}:${hourKey(new Date())}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 2 * 60 * 60);
  }

  if (count > limit) {
    return { allowed: false as const, retryAfterMs: msUntilNextHour(new Date()) };
  }

  return { allowed: true as const };
}
