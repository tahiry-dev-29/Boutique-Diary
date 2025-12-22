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
