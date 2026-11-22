/**
 * BYT Redis Cache & In-Memory Fallback Layer
 *
 * Provides resilient caching with TTL, namespace isolation, and rate-limiting.
 * If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, connects to Redis via Upstash REST.
 * Otherwise, seamlessly falls back to a high-performance in-memory TTL Map.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// In-memory fallback cache storage
const memoryStore = new Map<string, CacheEntry<any>>();

// Clean up expired in-memory entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((entry, key) => {
      if (entry.expiresAt <= now) {
        memoryStore.delete(key);
      }
    });
  }, 60_000);
}

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;

const isRedisConfigured = Boolean(REDIS_URL && REDIS_TOKEN);

async function redisCommand<T = any>(command: string, ...args: (string | number)[]): Promise<T | null> {
  if (!isRedisConfigured) return null;

  try {
    const url = `${REDIS_URL}/${[command, ...args.map(encodeURIComponent)].join("/")}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[Redis] command ${command} failed with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.result as T;
  } catch (err) {
    console.warn(`[Redis] Network error on command ${command}:`, err);
    return null;
  }
}

/**
 * Retrieve cached value by key
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const fullKey = `byt:${key}`;

  if (isRedisConfigured) {
    try {
      const raw = await redisCommand<string>("GET", fullKey);
      if (raw !== null && raw !== undefined) {
        return JSON.parse(raw) as T;
      }
      return null;
    } catch {
      // fallback to memory
    }
  }

  const entry = memoryStore.get(fullKey);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryStore.delete(fullKey);
    return null;
  }
  return entry.value as T;
}

/**
 * Set cache value with TTL in seconds (default: 300s = 5m)
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
  const fullKey = `byt:${key}`;
  const serialized = JSON.stringify(value);

  if (isRedisConfigured) {
    try {
      await redisCommand("SET", fullKey, serialized, "EX", ttlSeconds);
      return;
    } catch {
      // fallback to memory
    }
  }

  memoryStore.set(fullKey, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete a cached key
 */
export async function cacheDelete(key: string): Promise<void> {
  const fullKey = `byt:${key}`;

  if (isRedisConfigured) {
    try {
      await redisCommand("DEL", fullKey);
    } catch {
      // fallback
    }
  }

  memoryStore.delete(fullKey);
}

/**
 * Get or set cached value using a fetcher function
 */
export async function cacheRemember<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

/**
 * Rate limiter (Sliding Window / Token Bucket)
 * Defaults to 60 requests per minute per IP / identifier.
 */
export async function rateLimit(
  identifier: string,
  limit: number = 60,
  windowSeconds: number = 60
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;

  if (isRedisConfigured) {
    try {
      const fullKey = `byt:${key}`;
      const current = await redisCommand<number>("INCR", fullKey);
      if (current === 1) {
        await redisCommand("EXPIRE", fullKey, windowSeconds);
      }
      const count = current || 1;
      return {
        success: count <= limit,
        remaining: Math.max(0, limit - count),
        resetAt,
      };
    } catch {
      // fallback to memory rate limiter
    }
  }

  const entry = memoryStore.get(`byt:${key}`);
  if (!entry || entry.expiresAt <= now) {
    memoryStore.set(`byt:${key}`, {
      value: 1,
      expiresAt: resetAt,
    });
    return { success: true, remaining: limit - 1, resetAt };
  }

  const currentCount = (entry.value as number) + 1;
  entry.value = currentCount;

  return {
    success: currentCount <= limit,
    remaining: Math.max(0, limit - currentCount),
    resetAt: entry.expiresAt,
  };
}
