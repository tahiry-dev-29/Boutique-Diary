import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "jwt-secret-ecommerce",
);
const ADMIN_COOKIE_NAME = "admin_session";

export interface AdminPayload {
  adminId: number;
  username: string;
  email: string;
  role: string;
}

export async function verifyAdminToken(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Ensure payload has adminId (handle legacy tokens)
    if (!payload.adminId) {
      return null;
    }

    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function createAdminToken(
  payload: AdminPayload,
  rememberMe = false,
): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? "7d" : "24h")
    .sign(JWT_SECRET);
}

export function getAdminCookieOptions(rememberMe = false) {
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24,
    path: "/",
  };
}

export { ADMIN_COOKIE_NAME };
