"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutList, LayoutGrid, Archive, Trash2 } from "lucide-react";

export function ProductNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Tous les produits",
      href: "/admin/products",
      icon: LayoutList,
      active: pathname === "/admin/products",
    },
    {
      name: "En Promotion",
      href: "/admin/products/promotions",
      icon: LayoutGrid,
      active: pathname === "/admin/products/promotions",
    },
    {
      name: "Archives",
      href: "/admin/products/archive",
      icon: Archive,
      active: pathname === "/admin/products/archive",
    },
    {
      name: "Corbeille",
      href: "/admin/products/trash",
      icon: Trash2,
      active: pathname === "/admin/products/trash",
    },
  ];

  return (
    <div className="flex items-center space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-6 w-fit">
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            tab.active
              ? "bg-white dark:dark:bg-gray-800 text-black dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50",
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.name}
        </Link>
      ))}
    </div>
  );
}
