"use client";

import React, { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { usePathname } from "next/navigation";
import { useTheme, THEME_PRESETS } from "@/contexts/theme-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const pathname = usePathname();
  const { colorMode, preset, scale, radius, contentLayout, sidebarMode } =
    useTheme();

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const themeStyle = {
    "--theme-primary": THEME_PRESETS[preset].primary,
    "--theme-accent": THEME_PRESETS[preset].accent,
    "--theme-indicator": THEME_PRESETS[preset].indicator,
    "--scale-factor":
      scale === "default" ? "1" : scale === "xs" ? "0.875" : "1.125",
    "--radius":
      radius === "default"
        ? "0.625rem"
        : radius === "sm"
          ? "0.375rem"
          : radius === "md"
            ? "0.5rem"
            : radius === "lg"
              ? "0.75rem"
              : "1rem",
  } as React.CSSProperties;

  return (
    <div
      className={`flex min-h-screen bg-gray-50 dark:bg-linear-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 relative transition-colors duration-300 ${
        colorMode === "dark" ? "dark" : ""
      }`}
      style={themeStyle}
      data-theme={preset}
      data-scale={scale}
      data-radius={radius}
      data-content-layout={contentLayout}
      data-sidebar-mode={sidebarMode}
    >
      {}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 flex w-full">
        <Sidebar
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onToggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-x-hidden p-6 md:p-8">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
