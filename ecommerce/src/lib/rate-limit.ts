import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export type RateLimitConfig = {
  windowMs: number;
  max: number;
  keyPrefix: string;
};

type Entry = { count: number; resetTime: number };

const store = new Map<string, Entry>();

export const RATE_LIMITS = {
  general: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyPrefix: "rl:gen",
  } as RateLimitConfig,
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyPrefix: "rl:auth",
  } as RateLimitConfig,
  sensitive: {
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyPrefix: "rl:sens",
  } as RateLimitConfig,
  ai: {
    windowMs: 60 * 60 * 1000,
    max: 20,
    keyPrefix: "rl:ai",
  } as RateLimitConfig,
  admin: {
    windowMs: 15 * 60 * 1000,
    max: 60,
    keyPrefix: "rl:adm",
  } as RateLimitConfig,
} as const;

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

function cleanupIfNeeded(): void {
  if (store.size < 800) return;
  const now = Date.now();
  for (const [k, v] of store) {
    if (now > v.resetTime) store.delete(k);
  }
  if (store.size > 1000) {
    const toDelete = store.size - 800;
    let i = 0;
    for (const k of store.keys()) {
      if (i++ >= toDelete) break;
      store.delete(k);
    }
  }
}

export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
} {
  const ip = getClientIp(req);
  const cookieUser =
    req.cookies.get("appSession")?.value ??
    req.cookies.get("__session")?.value ??
    "";
  const userKey = cookieUser ? `u:${hashCookie(cookieUser)}` : `ip:${ip}`;
  const key = `${config.keyPrefix}:${userKey}`;

  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    entry = { count: 1, resetTime: now + config.windowMs };
    store.set(key, entry);
    cleanupIfNeeded();
    return {
      success: true,
      limit: config.max,
      remaining: config.max - 1,
      reset: Math.ceil(entry.resetTime / 1000),
    };
  }

  if (entry.count >= config.max) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      limit: config.max,
      remaining: 0,
      reset: Math.ceil(entry.resetTime / 1000),
      retryAfter,
    };
  }

  entry.count += 1;
  return {
    success: true,
    limit: config.max,
    remaining: config.max - entry.count,
    reset: Math.ceil(entry.resetTime / 1000),
  };
}

function hashCookie(v: string): string {
  let h = 0;
  for (let i = 0; i < Math.min(v.length, 64); i++)
    h = (h * 31 + v.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function getRateLimitForPath(pathname: string): RateLimitConfig {
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/admin/auth/login")
  )
    return RATE_LIMITS.auth;

  if (
    pathname.startsWith("/api/contact") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/upload-url-image") ||
    pathname.startsWith("/api/webhooks/payments")
  )
    return RATE_LIMITS.sensitive;

  if (
    pathname.startsWith("/api/assistant") ||
    pathname.startsWith("/api/admin/assistant") ||
    pathname.startsWith("/api/admin/products/generate") ||
    (pathname.startsWith("/api/admin/blog") &&
      pathname.endsWith("/regenerate")) ||
    pathname.startsWith("/api/geocode")
  )
    return RATE_LIMITS.ai;

  if (pathname.startsWith("/api/admin/")) return RATE_LIMITS.admin;

  return RATE_LIMITS.general;
}

export function buildRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}): Record<string, string> {
  const h: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
  if (result.retryAfter !== undefined)
    h["Retry-After"] = String(result.retryAfter);
  return h;
}

export function rateLimitResponse(result: {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests",
      message: `Rate limit exceeded. Try again in ${result.retryAfter ?? 60}s.`,
    },
    { status: 429, headers: buildRateLimitHeaders(result) },
  );
}

// For route handlers (nodejs runtime) — same logic but accepts generic Request
export function checkRateLimitGeneric(
  req: Request,
  config: RateLimitConfig,
  ipOverride?: string,
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
} {
  const xfwd = req.headers.get("x-forwarded-for");
  const ip =
    ipOverride ??
    (xfwd
      ? xfwd.split(",")[0]!.trim()
      : (req.headers.get("x-real-ip") ?? "127.0.0.1"));
  const key = `${config.keyPrefix}:ip:${ip}`;
  const now = Date.now();
  let entry = store.get(key);
  if (!entry || now > entry.resetTime) {
    entry = { count: 1, resetTime: now + config.windowMs };
    store.set(key, entry);
    cleanupIfNeeded();
    return {
      success: true,
      limit: config.max,
      remaining: config.max - 1,
      reset: Math.ceil(entry.resetTime / 1000),
    };
  }
  if (entry.count >= config.max) {
    return {
      success: false,
      limit: config.max,
      remaining: 0,
      reset: Math.ceil(entry.resetTime / 1000),
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }
  entry.count += 1;
  return {
    success: true,
    limit: config.max,
    remaining: config.max - entry.count,
    reset: Math.ceil(entry.resetTime / 1000),
  };
}
