import { prisma } from "@/lib/prisma";
import { DEFAULT_ROLES, RoleConfig } from "./permissions-config";
import { verifyAdminToken } from "./adminAuth";
import { NextResponse } from "next/server";

export async function getRolePermissions(roleName: string): Promise<string[]> {
  
  if (roleName === "superadmin" || roleName === "SUPERADMIN") {
    return DEFAULT_ROLES.find((r) => r.id === "superadmin")?.permissions || [];
  }

  try {
    
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "admin_roles" },
    });

    if (setting && setting.value) {
      const roles = JSON.parse(setting.value) as RoleConfig[];
      const roleConfig = roles.find(
        (r) => r.name.toLowerCase() === roleName.toLowerCase()
      );
      if (roleConfig) {
        return roleConfig.permissions;
      }
    }
  } catch (error) {
    console.warn("Failed to load roles from DB, falling back to defaults", error);
  }

  
  const defaultRole = DEFAULT_ROLES.find(
    (r) => r.name.toLowerCase() === roleName.toLowerCase()
  );
  return defaultRole?.permissions || [];
}

export async function hasPermission(
  roleName: string,
  permission: string
): Promise<boolean> {
  const permissions = await getRolePermissions(roleName);
  return permissions.includes(permission);
}

export async function checkApiPermission(
  requiredPermission: string
): Promise<NextResponse | null> {
  const token = await verifyAdminToken();

  if (!token) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  const hasAccess = await hasPermission(token.role, requiredPermission);

  if (!hasAccess) {
    return NextResponse.json(
      { error: "Permission refusée" },
      { status: 403 }
    );
  }

  return null; 
}
