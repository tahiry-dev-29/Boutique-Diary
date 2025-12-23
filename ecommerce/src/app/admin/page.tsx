"use client";

import React, { useEffect, useState } from "react";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import { AdminUser } from "@/types/admin";
import { useRouter } from "next/navigation";
import { RedirectMessage } from "@/components/admin/redirect-message";

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/auth/me");
        if (response.ok) {
          const data = await response.json();
          setAdmin(data.admin);
        }

        if (!response.ok) {
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const user = admin || {
    id: 999,
    username: "Admin",
    email: "admin@boutique.com",
    role: "ADMIN" as const,
  };

  return (
    <div className="space-y-6">
      <RedirectMessage />
      <AdminDashboard user={user} />
    </div>
  );
}
