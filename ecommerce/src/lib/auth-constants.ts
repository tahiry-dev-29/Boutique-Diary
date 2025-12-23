export const SESSION_COOKIE = "session";
export const ADMIN_SESSION_COOKIE = "admin_session";

export const ROLE_HIERARCHY = [
  "CUSTOMER",
  "EMPLOYEE",
  "ADMIN",
  "SUPERADMIN",
] as const;
export type Role = (typeof ROLE_HIERARCHY)[number];

export interface UserPayload {
  userId: number;
  username: string;
  email: string;
  role: Role;
}

export function hasMinRole(
  userRole: Role | string,
  requiredRole: Role,
): boolean {
  const normalizedUserRole = userRole.toUpperCase() as Role;
  const userIndex = ROLE_HIERARCHY.indexOf(normalizedUserRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

export function isAdmin(role: Role | string): boolean {
  return hasMinRole(role, "ADMIN");
}

export function isSuperAdmin(role: Role | string): boolean {
  return role.toUpperCase() === "SUPERADMIN";
}
