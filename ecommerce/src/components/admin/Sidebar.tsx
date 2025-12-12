"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Tags,
  CreditCard,
  Truck,
  BarChart,
  Palette,
  ChevronRight,
  Menu,
  ChevronDown,
  User,
  Trash,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: number;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  href: string;
}

const navItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "products",
    label: "Produits",
    icon: ShoppingBag,
    subItems: [
      {
        id: "all-products",
        label: "Tous les produits",
        href: "/admin/products",
      },
      {
        id: "add-product",
        label: "Ajouter un produit",
        href: "/admin/products/new",
      },
      { id: "categories", label: "Catégories", href: "/admin/categories" },
      {
        id: "stock",
        label: "Stock / inventaire",
        href: "/admin/products/stock",
      },
    ],
  },
  {
    id: "orders",
    label: "Commandes",
    icon: ShoppingCart,
    subItems: [
      { id: "all-orders", label: "Liste des commandes", href: "/admin/orders" },
      {
        id: "pending-orders",
        label: "Commandes en attente",
        href: "/admin/orders/pending",
      },
      {
        id: "returns",
        label: "Retours / remboursements",
        href: "/admin/orders/returns",
      },
    ],
  },
  {
    id: "customers",
    label: "Clients",
    icon: Users,
    subItems: [
      {
        id: "all-customers",
        label: "Liste des clients",
        href: "/admin/customers",
      },
      {
        id: "purchase-history",
        label: "Historique des achats",
        href: "/admin/customers/history",
      },
    ],
  },
  {
    id: "employees",
    label: "Employés",
    icon: User,
    subItems: [
      {
        id: "all-employees",
        label: "Liste des employés",
        href: "/admin/employees",
      },
      {
        id: "add-employee",
        label: "Ajouter un employé",
        href: "/admin/employees/new",
      },
      {
        id: "roles",
        label: "Gestion des rôles",
        href: "/admin/employees/roles",
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Tags,
    subItems: [
      {
        id: "promo-codes",
        label: "Codes promo",
        href: "/admin/marketing/codes",
      },
      {
        id: "promotions",
        label: "Promotions",
        href: "/admin/marketing/promotions",
      },
    ],
  },
  {
    id: "payment",
    label: "Paiement",
    icon: CreditCard,
    subItems: [
      {
        id: "payment-methods",
        label: "Méthodes de paiement",
        href: "/admin/payment/methods",
      },
      {
        id: "transactions",
        label: "Transactions",
        href: "/admin/payment/transactions",
      },
    ],
  },
  {
    id: "shipping",
    label: "Livraison",
    icon: Truck,
    subItems: [
      {
        id: "shipping-methods",
        label: "Méthodes de livraison",
        href: "/admin/shipping/methods",
      },
      {
        id: "shipping-zones",
        label: "Zones de livraison",
        href: "/admin/shipping/zones",
      },
    ],
  },
  {
    id: "reports",
    label: "Rapports",
    icon: BarChart,
    subItems: [
      { id: "sales-reports", label: "Ventes", href: "/admin/reports/sales" },
      {
        id: "product-reports",
        label: "Produits",
        href: "/admin/reports/products",
      },
      {
        id: "customer-reports",
        label: "Clients",
        href: "/admin/reports/customers",
      },
    ],
  },
  {
    id: "appearance",
    label: "Apparence",
    icon: Palette,
    subItems: [
      { id: "logo", label: "Logo", href: "/admin/appearance/logo" },
      { id: "banner", label: "Bannière", href: "/admin/appearance/banner" },
      { id: "layout", label: "Disposition", href: "/admin/appearance/layout" },
    ],
  },
];

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const isSectionActive = (item: MenuItem) => {
    if (item.href === pathname) return true;
    if (item.subItems) {
      return item.subItems.some(sub => pathname.startsWith(sub.href));
    }
    return false;
  };

  React.useEffect(() => {
    navItems.forEach(item => {
      if (
        item.subItems &&
        isSectionActive(item) &&
        !expandedSections.includes(item.id)
      ) {
        setExpandedSections(prev => [...prev, item.id]);
      }
    });
  }, [pathname]);

  const toggleSection = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  return (
    <div
      className={`bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-6 transition-all duration-300 sticky top-0 h-screen overflow-hidden ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {}
      <div
        className={`flex items-center mb-8 px-4 ${isExpanded ? "justify-between" : "justify-center"}`}
      >
        <div className="flex items-center space-x-3">
          {}
          <div className="h-8 w-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold">
            B
          </div>
          {isExpanded && (
            <h2 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
              Boutique Dialy
            </h2>
          )}
        </div>
      </div>

      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mx-auto mb-6 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto no-scrollbar">
        {navItems.map(item => {
          const isActive = isSectionActive(item);
          const isOpen = expandedSections.includes(item.id);

          if (!item.subItems) {
            return (
              <Link
                key={item.id}
                href={item.href || "#"}
                className={`w-full flex items-center rounded-lg transition-all group ${
                  isExpanded ? "px-3 py-2" : "p-2 justify-center"
                } ${
                  isActive
                    ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <item.icon
                    className={`w-5 h-5 shrink-0 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"}`}
                  />
                </div>
                {isExpanded && (
                  <span className="ml-3 font-medium whitespace-nowrap text-sm">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (isExpanded) {
                    toggleSection(item.id);
                  } else {
                    setIsExpanded(true);
                    setExpandedSections([item.id]);
                  }
                }}
                className={`w-full flex items-center justify-between rounded-lg transition-all group ${
                  isExpanded ? "px-3 py-2" : "p-2 justify-center"
                } ${
                  isActive
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`w-5 h-5 shrink-0 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"}`}
                  />
                  {isExpanded && (
                    <span className="ml-3 font-medium whitespace-nowrap text-sm">
                      {item.label}
                    </span>
                  )}
                </div>
                {isExpanded && (
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {}
              {isExpanded && isOpen && (
                <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1 py-1">
                  {item.subItems.map(subItem => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.id}
                        href={subItem.href}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          isSubActive
                            ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div
        className={`mt-auto pt-4 px-3 border-t border-gray-200 dark:border-gray-800 space-y-1`}
      >
        <button
          className={`w-full flex items-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all ${
            isExpanded ? "px-3 py-2" : "p-2 justify-center"
          }`}
        >
          <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          {isExpanded && (
            <span className="ml-3 text-sm font-medium whitespace-nowrap">
              Profil
            </span>
          )}
        </button>
        <button
          className={`w-full flex items-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all group ${
            isExpanded ? "px-3 py-2" : "p-2 justify-center"
          }`}
        >
          <Trash className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-red-500" />
          {isExpanded && (
            <span className="ml-3 text-sm font-medium whitespace-nowrap group-hover:text-red-600">
              Corbeille
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
