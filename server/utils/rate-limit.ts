import type { H3Event } from "h3";
import { getRequestIP, setResponseHeader } from "h3";

type Entry = { count: number; resetAt: number };
const attempts = new Map<string, Entry>();

export const enforceRateLimit = (event: H3Event, scope: string, limit: number, windowMs: number) => {
  const now = Date.now();
  const ip = getRequestIP(event, { xForwardedFor: process.env.TRUST_PROXY === "true" }) || "unknown";
  const key = `${scope}:${ip}`;
  const current = attempts.get(key);
  const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
  entry.count += 1;
  attempts.set(key, entry);

  setResponseHeader(event, "x-ratelimit-limit", String(limit));
  setResponseHeader(event, "x-ratelimit-remaining", String(Math.max(limit - entry.count, 0)));
  setResponseHeader(event, "x-ratelimit-reset", String(Math.ceil(entry.resetAt / 1000)));

  if (attempts.size > 5000) {
    for (const [attemptKey, value] of attempts) {
      if (value.resetAt <= now) attempts.delete(attemptKey);
    }
  }

  if (entry.count > limit) {
    setResponseHeader(event, "retry-after", Math.ceil((entry.resetAt - now) / 1000));
    throw createError({ statusCode: 429, statusMessage: "Too many attempts. Try again later." });
  }
};
