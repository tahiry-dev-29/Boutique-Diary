"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/contexts/theme-context";

export default function MainLayout({
  children,
  categories,
}: {
  children: React.ReactNode;
  categories: any[];
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <ThemeProvider>
      {!isAdminPage && <Navbar categories={categories} />}
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
