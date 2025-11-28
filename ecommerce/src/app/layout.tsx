"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {!isAdminPage && (
          <nav className="p-4 bg-gray-800 text-white flex justify-between">
            <Link href="/" className="text-xl font-bold">
              Home
            </Link>
            <div>
              <Link href="/login" className="mr-4 hover:underline">
                Login
              </Link>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
            </div>
          </nav>
        )}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
