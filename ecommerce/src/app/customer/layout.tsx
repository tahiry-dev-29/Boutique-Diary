"use client";

import React from "react";
import Link from "next/link";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { ArrowLeft } from "lucide-react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen dark:bg-gray-900/50">
      {}
      <header className="dark:border-gray-700/50 border-b border-border px-4 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Retour à la boutique
            </Link>
          </div>
          <Link href="/" className="font-bold text-foreground">
            BOUTIQUE DIARY
          </Link>
        </div>
      </header>

      {}
      <div className="flex">
        <CustomerSidebar />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
