"use client";

import React, { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />
      <main className="flex-1 overflow-x-hidden p-6 md:p-8">{children}</main>
    </div>
  );
}
