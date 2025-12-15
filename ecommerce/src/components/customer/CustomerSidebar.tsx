"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { id: "account", label: "Mon compte", icon: User, href: "/customer" },
  {
    id: "orders",
    label: "Mes commandes",
    icon: ShoppingBag,
    href: "/customer/orders",
  },
  {
    id: "wishlist",
    label: "Mes favoris",
    icon: Heart,
    href: "/customer/wishlist",
  },
  {
    id: "addresses",
    label: "Mes adresses",
    icon: MapPin,
    href: "/customer/addresses",
  },
  {
    id: "settings",
    label: "Paramètres",
    icon: Settings,
    href: "/customer/settings",
  },
];

export default function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border h-full min-h-screen p-4">
      {/* User info */}
      <div className="mb-6 p-4 bg-muted rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
            JD
          </div>
          <div>
            <p className="font-semibold text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">john@example.com</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all group ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight
                size={16}
                className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100" : ""}`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-8 pt-6 border-t border-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium">
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
