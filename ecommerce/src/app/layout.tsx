"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/contexts/theme-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased dark:bg-gray-900/50 text-foreground">
        <ThemeProvider>
          {!isAdminPage && <Navbar />}
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
