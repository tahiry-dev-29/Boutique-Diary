"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <html lang="en">
      <body className="antialiased">
        {!isAdminPage && <Navbar />}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
