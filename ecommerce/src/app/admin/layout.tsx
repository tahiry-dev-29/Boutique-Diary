"use client";

import React, { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => !prev);
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:dark:bg-gray-800">
      <Sidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden p-6 md:p-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
