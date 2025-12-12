// src/components/admin/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { UserNav } from "./UserNav";
import { AdminPayload } from "@/lib/adminAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "next/navigation";

export function Header() {
  const [user, setUser] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/admin/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (pathname === "/admin/login") {
    return null; // Don't show header on login page
  }
  
  return (
    <div className="border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          {loading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <UserNav user={user} />
          ) : (
            // Optional: show a login button if not authenticated
            null
          )}
        </div>
      </div>
    </div>
  );
}