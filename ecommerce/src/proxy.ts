import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";
import {
  buildRateLimitHeaders,
  checkRateLimit,
  getRateLimitForPath,
  rateLimitResponse,
} from "@/lib/rate-limit";

const BYPASS_AUTH = new Set(["/api/auth/social", "/api/geocode"]);

function shouldBypassAuth(pathname: string): boolean {
  for (const p of BYPASS_AUTH) if (pathname.startsWith(p)) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    const cfg = getRateLimitForPath(pathname);
    const result = checkRateLimit(request, cfg);
    if (!result.success) return rateLimitResponse(result);

    let res: NextResponse;
    if (shouldBypassAuth(pathname)) {
      res = NextResponse.next();
    } else {
      res = (await auth0.middleware(request)) as NextResponse;
    }
    const h = buildRateLimitHeaders(result);
    for (const [k, v] of Object.entries(h)) res.headers.set(k, v);
    return res;
  }

  return await auth0.middleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
