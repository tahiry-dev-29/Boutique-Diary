"use client";

import React, { useState } from "react";
import Link from "next/link";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen dark:bg-gray-900/50">
      {/* Header */}
      <header className="dark:border-gray-700/50 border-b border-border px-4 py-3 bg-background sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <Link
              href="/shop"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Retour à la boutique</span>
            </Link>
          </div>
          <Link href="/" className="font-bold text-foreground">
            BOUTIQUE DIARY
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex relative">
        <CustomerSidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 md:p-8 w-full max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
