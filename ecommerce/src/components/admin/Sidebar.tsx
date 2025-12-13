"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
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
  Package,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: number;
  subItems?: SubMenuItem[];
  permission?: string;
}

interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  permission?: string;
}

interface NavSection {
  title?: string;
  items: MenuItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      {
        id: "dashboard",
        label: "Vue d'ensemble",
        icon: LayoutDashboard,
        href: "/admin",
      },
    ],
  },
  {
    title: "Catalogue",
    items: [
      {
        id: "products",
        label: "Produits",
        icon: ShoppingBag,
        href: "/admin/products",
        permission: "products.view",
      },
      {
        id: "stock",
        label: "Gestion des Stocks",
        icon: Package,
        href: "/admin/products/stock",
        permission: "products.edit", // Assuming stock edit needs edit permission
      },
    ],
  },
  {
    title: "Ventes",
    items: [
      {
        id: "orders",
        label: "Commandes",
        icon: ShoppingCart,
        href: "/admin/orders",
        permission: "orders.view",
      },
      {
        id: "customers",
        label: "Clients",
        icon: Users,
        href: "/admin/customers",
        permission: "customers.view",
      },
    ],
  },
  {
    title: "Gestion",
    items: [
      {
        id: "employees",
        label: "Employés",
        icon: User,
        href: "/admin/employees",
        permission: "employees.view",
      },
      {
        id: "marketing",
        label: "Marketing",
        icon: Tags,
        permission: "settings.view",
        subItems: [
          {
            id: "promo-codes",
            label: "Codes promo",
            href: "/admin/marketing/codes",
            permission: "settings.view",
          },
          {
            id: "promotions",
            label: "Promotions",
            href: "/admin/marketing/promotions",
            permission: "settings.view",
          },
        ],
      },
      {
        id: "reports",
        label: "Rapports",
        icon: BarChart,
        permission: "reports.view",
        subItems: [
          {
            id: "sales-reports",
            label: "Ventes",
            href: "/admin/reports/sales",
            permission: "reports.view",
          },
          {
            id: "product-reports",
            label: "Produits",
            href: "/admin/reports/products",
            permission: "reports.view",
          },
          {
            id: "customer-reports",
            label: "Clients",
            href: "/admin/reports/customers",
            permission: "reports.view",
          },
        ],
      },
    ],
  },
  {
    title: "Paramètres",
    items: [
      {
        id: "payment",
        label: "Paiement",
        icon: CreditCard,
        permission: "settings.view",
        subItems: [
          {
            id: "payment-methods",
            label: "Méthodes de paiement",
            href: "/admin/payment/methods",
            permission: "settings.view",
          },
          {
            id: "transactions",
            label: "Transactions",
            href: "/admin/payment/transactions",
            permission: "settings.view",
          },
        ],
      },
      {
        id: "shipping",
        label: "Livraison",
        icon: Truck,
        permission: "settings.view",
        subItems: [
          {
            id: "shipping-methods",
            label: "Méthodes de livraison",
            href: "/admin/shipping/methods",
            permission: "settings.view",
          },
          {
            id: "shipping-zones",
            label: "Zones de livraison",
            href: "/admin/shipping/zones",
            permission: "settings.view",
          },
        ],
      },
      {
        id: "appearance",
        label: "Apparence",
        icon: Palette,
        permission: "appearance.edit",
        subItems: [
          {
            id: "logo",
            label: "Logo",
            href: "/admin/appearance/logo",
            permission: "appearance.edit",
          },
          {
            id: "banner",
            label: "Bannière",
            href: "/admin/appearance/banner",
            permission: "appearance.edit",
          },
          {
            id: "layout",
            label: "Disposition",
            href: "/admin/appearance/layout",
            permission: "appearance.edit",
          },
        ],
      },
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
  const { hasPermission, loading } = usePermissions();

  const filterMenuItem = (item: MenuItem): boolean => {
    return !item.permission || hasPermission(item.permission);
  };

  const getFilteredSections = (): NavSection[] => {
    return navSections
      .map(section => ({
        ...section,
        items: section.items
          .filter(filterMenuItem)
          .map(item => ({
            ...item,
            subItems: item.subItems?.filter(
              sub => !sub.permission || hasPermission(sub.permission),
            ),
          }))
          .filter(item => !item.subItems || item.subItems.length > 0),
      }))
      .filter(section => section.items.length > 0);
  };

  const filteredSections = getFilteredSections();

  const isItemActive = (item: MenuItem) => {
    if (item.href === pathname) return true;
    if (item.subItems) {
      return item.subItems.some(sub => pathname.startsWith(sub.href));
    }
    return false;
  };

  React.useEffect(() => {
    filteredSections.forEach(section => {
      section.items.forEach(item => {
        if (
          item.subItems &&
          isItemActive(item) &&
          !expandedSections.includes(item.id)
        ) {
          setExpandedSections(prev => [...prev, item.id]);
        }
      });
    });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSection = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  /* User Menu State */
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      window.location.href = "/admin-login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-6 transition-all duration-300 sticky top-0 h-screen ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-center h-full">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Modal
        title="Confirmer la déconnexion"
        description="Êtes-vous sûr de vouloir vous déconnecter ?"
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
      >
        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Annuler
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Déconnexion
          </button>
        </div>
      </Modal>

      <div
        className={`bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-6 transition-all duration-300 sticky top-0 h-screen overflow-hidden ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        {/* Brand */}
        <div
          className={`flex items-center mb-8 px-4 ${isExpanded ? "justify-between" : "justify-center"}`}
        >
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-black dark:bg-gray-100 rounded-lg flex items-center justify-center text-white dark:text-black font-bold">
              B
            </div>
            {isExpanded && (
              <h2 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                Boutique Dialy
              </h2>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 px-3 overflow-y-auto no-scrollbar">
          {filteredSections.map((section, index) => (
            <div key={index} className="space-y-1">
              {isExpanded && section.title && (
                <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              {/* Divider for collapsed mode if needed, but spacing usually enough */}
              {!isExpanded && section.title && index > 0 && (
                <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-2" />
              )}

              {section.items.map(item => {
                const isActive = isItemActive(item);
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
            </div>
          ))}
        </nav>

        {/* User Menu (Collapsible) */}
        {isExpanded && (
          <div
            className={`px-3 space-y-1 overflow-hidden transition-all duration-300 ${
              isUserMenuOpen ? "max-h-48 opacity-100 mb-2" : "max-h-0 opacity-0"
            }`}
          >
            <button
              className={`w-full flex items-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm transition-all px-3 py-2`}
            >
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="ml-3 text-sm font-medium whitespace-nowrap">
                Profil
              </span>
            </button>
            <button
              className={`w-full flex items-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm transition-all group px-3 py-2`}
            >
              <Trash className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-red-500" />
              <span className="ml-3 text-sm font-medium whitespace-nowrap group-hover:text-red-600">
                Corbeille
              </span>
            </button>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`w-full flex items-center rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:shadow-sm transition-all group px-3 py-2`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 shrink-0"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              <span className="ml-3 text-sm font-medium whitespace-nowrap">
                Déconnexion
              </span>
            </button>
          </div>
        )}

        {/* Footer Bar */}
        <div className="mt-auto pt-4 px-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${
                isExpanded
                  ? "p-2 px-3 flex-1 mr-2"
                  : "p-2 justify-center w-full"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0">
                AD
              </div>
              {isExpanded && (
                <div className="ml-3 text-left overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    Admin
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    admin@store.com
                  </p>
                </div>
              )}
              {isExpanded && (
                <ChevronDown
                  className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {isExpanded && (
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                title="Réduire la barre latérale"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
          </div>

          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full flex items-center justify-center p-2 mt-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
