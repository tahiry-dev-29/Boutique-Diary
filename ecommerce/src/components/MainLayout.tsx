"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/contexts/theme-context";
import GlobalReviewModal from "./store/GlobalReviewForm";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";

export default function MainLayout({
  children,
  categories,
}: {
  children: React.ReactNode;
  categories: any[];
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <Auth0Provider>
      <ThemeProvider>
        {!isAdminPage && !isAuthPage && <Navbar categories={categories} />}
        {children}
        {!isAdminPage && !isAuthPage && <GlobalReviewModal />}
        <Toaster />
      </ThemeProvider>
    </Auth0Provider>
  );
}
