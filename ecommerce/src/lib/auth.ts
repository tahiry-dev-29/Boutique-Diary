import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "jwt-secret-ecommerce",
);

import {
  SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
  Role,
  UserPayload,
  ROLE_HIERARCHY,
} from "./auth-constants";

export { SESSION_COOKIE, ADMIN_SESSION_COOKIE, ROLE_HIERARCHY };
export type { Role, UserPayload };

export async function verifyToken(
  cookieName: string = SESSION_COOKIE,
): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;

    console.log(
      `[verifyToken] Verifying ${cookieName}. Token exists: ${!!token}`,
    );

    if (!token) {
      console.log(`[verifyToken] No token found for ${cookieName}`);
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function verifyAdminToken(): Promise<UserPayload | null> {
  const user = await verifyToken(ADMIN_SESSION_COOKIE);
  if (!user || !hasMinRole(user.role, "ADMIN")) {
    return null;
  }
  return user;
}

export async function createToken(
  payload: UserPayload,
  rememberMe = false,
): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? "7d" : "24h")
    .sign(JWT_SECRET);
}

export function getCookieOptions(cookieName: string, rememberMe = false) {
  return {
    name: cookieName,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24,
    path: "/",
  };
}

export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

export function hasRole(userRole: Role, role: Role): boolean {
  return userRole === role;
}

export function isAdmin(role: Role): boolean {
  return hasMinRole(role, "ADMIN");
}

export function isSuperAdmin(role: Role): boolean {
  return role === "SUPERADMIN";
}

export const AdminPayload = {} as UserPayload;
export type AdminPayload = UserPayload;
export const createAdminToken = createToken;
export const getAdminCookieOptions = (rememberMe = false) =>
  getCookieOptions(ADMIN_SESSION_COOKIE, rememberMe);
