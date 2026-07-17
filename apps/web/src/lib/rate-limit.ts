/**
 * In-memory rate limit placeholder for development.
 * Replace with Redis/Upstash in production.
 */

import { isProduction } from '@/lib/env';

const buckets = new Map<string, { count: number; resetAt: number }>();

type RateLimitResult = { allowed: boolean; remaining: number };

async function checkRateLimitUpstash(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const bucketKey = `rl:${key}`;
  const endpoint = `${url.replace(/\/$/, '')}/pipeline`;
  const ttlSec = Math.max(1, Math.ceil(windowMs / 1000));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', bucketKey],
      ['EXPIRE', bucketKey, ttlSec, 'NX'],
    ]),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`rate-limit provider failed: ${response.status}`);
  }

  const payload = (await response.json()) as Array<{ result?: number }>;
  const count = Number(payload?.[0]?.result ?? 0);
  if (!Number.isFinite(count) || count <= 0) {
    return { allowed: true, remaining: limit - 1 };
  }

  if (count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: Math.max(0, limit - count) };
}

function checkRateLimitInMemory(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export async function checkRateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  try {
    const external = await checkRateLimitUpstash(key, limit, windowMs);
    if (external) return external;
  } catch {
    if (isProduction()) {
      // fail-closed in production if configured provider is unstable
      return { allowed: false, remaining: 0 };
    }
  }

  return checkRateLimitInMemory(key, limit, windowMs);
}
