import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "jwt-secret-ecommerce",
);

// Role hierarchy (lower index = less permissions)
const ROLE_HIERARCHY = ["CUSTOMER", "EMPLOYEE", "ADMIN", "SUPERADMIN"] as const;
export type Role = (typeof ROLE_HIERARCHY)[number];

// Cookie names
export const SESSION_COOKIE = "session";
export const ADMIN_SESSION_COOKIE = "admin_session";

// JWT Payload interface
export interface UserPayload {
  userId: number;
  username: string;
  email: string;
  role: Role;
}

// Verify user token from cookie
export async function verifyToken(
  cookieName: string = SESSION_COOKIE,
): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

// Verify admin token (convenience function)
export async function verifyAdminToken(): Promise<UserPayload | null> {
  const user = await verifyToken(ADMIN_SESSION_COOKIE);
  if (!user || !hasMinRole(user.role, "ADMIN")) {
    return null;
  }
  return user;
}

// Create JWT token
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

// Get cookie options
export function getCookieOptions(cookieName: string, rememberMe = false) {
  return {
    name: cookieName,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24,
    path: "/",
  };
}

// Check if user has minimum required role
export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

// Check if user has exact role
export function hasRole(userRole: Role, role: Role): boolean {
  return userRole === role;
}

// Check if user is admin (ADMIN or SUPERADMIN)
export function isAdmin(role: Role): boolean {
  return hasMinRole(role, "ADMIN");
}

// Check if user is superadmin
export function isSuperAdmin(role: Role): boolean {
  return role === "SUPERADMIN";
}

// Legacy exports for backward compatibility
export const AdminPayload = {} as UserPayload;
export type AdminPayload = UserPayload;
export const createAdminToken = createToken;
export const getAdminCookieOptions = (rememberMe = false) =>
  getCookieOptions(ADMIN_SESSION_COOKIE, rememberMe);
