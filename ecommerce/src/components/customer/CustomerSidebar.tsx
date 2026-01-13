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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const navItems = [
  {
    id: "account",
    label: "Mon compte",
    icon: User,
    href: "/dashboard/customer",
  },
  {
    id: "orders",
    label: "Mes commandes",
    icon: ShoppingBag,
    href: "/dashboard/customer/orders",
  },
  {
    id: "wishlist",
    label: "Mes favoris",
    icon: Heart,
    href: "/dashboard/customer/wishlist",
  },
  {
    id: "addresses",
    label: "Mes adresses",
    icon: MapPin,
    href: "/dashboard/customer/addresses",
  },
  {
    id: "settings",
    label: "Paramètres",
    icon: Settings,
    href: "/dashboard/customer/settings",
  },
];

import { cn } from "@/lib/utils";

interface CustomerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CustomerSidebar({
  isOpen,
  onClose,
}: CustomerSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Auth check failed", err);
    }
  };

  React.useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      {}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen w-64 bg-background dark:border-gray-700/50 border-r border-border p-4 z-50 transition-transform duration-300 md:translate-x-0 overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between md:hidden mb-4">
          <span className="font-bold text-lg">Menu</span>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-md">
            <ChevronRight className="rotate-180" size={20} />
          </button>
        </div>

        {}
        <div className="mb-6 p-4 bg-muted rounded-xl">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-background">
              <AvatarImage src={user?.photo} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {user?.username?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-foreground truncate">
                {user?.username || "Chargement..."}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
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

        {}
        <div className="mt-8 pt-6 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
