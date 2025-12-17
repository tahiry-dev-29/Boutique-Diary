"use client";

import { useState, useEffect } from "react";
import { RoleConfig, DEFAULT_ROLES } from "@/lib/permissions-config";

interface UserProfile {
  id: number;
  username: string;
  email: string; 
  role: string;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      
      const authRes = await fetch("/api/admin/auth/me");
      if (!authRes.ok) {
        setLoading(false);
        return;
      }
      const user = await authRes.json();
      setUserRole(user.role);

      
      if (user.role === "superadmin" || user.role === "SUPERADMIN") {
        const superAdminPerms = DEFAULT_ROLES.find(r => r.id === "superadmin")?.permissions;
        setPermissions(superAdminPerms || []);
        setLoading(false);
        return;
      }

      
      const settingsRes = await fetch("/api/settings?key=admin_roles");
      let rolePermissions: string[] = [];
      
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.value) {
          try {
            const roles = JSON.parse(data.value) as RoleConfig[];
            const myRole = roles.find(r => r.name.toLowerCase() === user.role.toLowerCase());
            if (myRole) {
              rolePermissions = myRole.permissions;
            }
          } catch (e) {
            console.error("Error parsing roles", e);
          }
        }
      }

      
      if (rolePermissions.length === 0) {
        const defaultRole = DEFAULT_ROLES.find(r => r.name.toLowerCase() === user.role.toLowerCase());
        if (defaultRole) {
          rolePermissions = defaultRole.permissions;
        }
      }

      setPermissions(rolePermissions);
    } catch (error) {
      console.error("Error loading permissions", error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permissionId: string) => {
    if (loading) return false;
    return permissions.includes(permissionId);
  };

  return { permissions, loading, hasPermission, userRole };
}
