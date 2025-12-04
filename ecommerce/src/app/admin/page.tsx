"use client";

import React, { useState } from "react";
import ProductList from "@/components/admin/ProductList";
import { Product } from "@/types/admin";
import ProductForm from "@/components/admin/ProductForm";
import ProductViewModal from "@/components/admin/ProductViewModal";
import CategoryList from "@/components/admin/CategoryList";
import CategoryForm from "@/components/admin/CategoryForm";
import { Category } from "@/types/category";

// Icônes SVG natives
const Icons = {
  Sparkles: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  ),
  Home: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  Messages: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
  ),
  ShoppingBag: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  ),
  ShoppingCart: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  Users: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  Tag: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  ),
  CreditCard: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
  Truck: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
      />
    </svg>
  ),
  ChartBar: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  User: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  Trash: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Folder: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 transition-transform"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
  Menu: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
};

// Structure de navigation
interface MenuItem {
  id: string;
  label: string;
  icon: () => React.ReactElement;
  badge?: number;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
}

const navItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: Icons.Home,
    subItems: [
      { id: "overview", label: "Vue d'ensemble" },
      { id: "statistics", label: "Statistiques" },
      { id: "activity", label: "Activité récente" },
    ],
  },
  {
    id: "products",
    label: "Produits",
    icon: Icons.ShoppingBag,
    subItems: [
      { id: "all-products", label: "Tous les produits" },
      { id: "add-product", label: "Ajouter un produit" },
      { id: "categories", label: "Catégories" },
      { id: "stock", label: "Stock / inventaire" },
    ],
  },
  {
    id: "orders",
    label: "Commandes",
    icon: Icons.ShoppingCart,
    subItems: [
      { id: "all-orders", label: "Liste des commandes" },
      { id: "pending-orders", label: "Commandes en attente" },
      { id: "returns", label: "Retours / remboursements" },
    ],
  },
  {
    id: "customers",
    label: "Clients",
    icon: Icons.Users,
    subItems: [
      { id: "all-customers", label: "Liste des clients" },
      { id: "purchase-history", label: "Historique des achats" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Icons.Tag,
    subItems: [
      { id: "promo-codes", label: "Codes promo" },
      { id: "promotions", label: "Promotions" },
    ],
  },
  {
    id: "payment",
    label: "Paiement",
    icon: Icons.CreditCard,
    subItems: [
      { id: "payment-methods", label: "Méthodes de paiement" },
      { id: "transactions", label: "Transactions" },
    ],
  },
  {
    id: "shipping",
    label: "Livraison",
    icon: Icons.Truck,
    subItems: [
      { id: "shipping-methods", label: "Méthodes de livraison" },
      { id: "shipping-zones", label: "Zones de livraison" },
    ],
  },
  {
    id: "reports",
    label: "Rapports",
    icon: Icons.ChartBar,
    subItems: [
      { id: "sales-reports", label: "Ventes" },
      { id: "product-reports", label: "Produits" },
      { id: "customer-reports", label: "Clients" },
    ],
  },
];

// Composant Sidebar Collapsible
const CollapsibleSidebar = ({
  isExpanded,
  setIsExpanded,
  activeSection,
  setActiveSection,
  activeSubSection,
  setActiveSubSection,
}: {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  activeSubSection: string;
  setActiveSubSection: (subSection: string) => void;
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      // Si la section est déjà ouverte, la fermer
      setExpandedSections(expandedSections.filter((id) => id !== sectionId));
    } else {
      // Sinon, fermer toutes les autres et ouvrir celle-ci (accordéon)
      setExpandedSections([sectionId]);
    }
  };

  return (
    <div
      className={`bg-[#C4C4C4] flex flex-col py-6 transition-all duration-300 sticky top-0 h-screen ${
        isExpanded ? "w-70" : "w-20"
      }`}
    >
      {/* Header avec logo et toggle */}
      <div
        className={`flex items-center mb-8 px-4 ${isExpanded ? "justify-between" : "justify-center"}`}
      >
        <div className="flex items-center space-x-3">
          <div className="text-gray-700">
            <Icons.Sparkles />
          </div>
          {isExpanded && (
            <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">
              Menu
            </h2>
          )}
        </div>
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 hover:bg-gray-300 rounded-lg transition-colors"
            aria-label="Fermer le menu"
          >
            <Icons.ChevronRight />
          </button>
        )}
      </div>

      {/* Bouton pour ouvrir quand fermé */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mx-auto mb-6 p-2 hover:bg-gray-300 rounded-lg transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Icons.Menu />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const isOpen = expandedSections.includes(item.id);

          return (
            <div key={item.id}>
              {/* Item principal */}
              <button
                onClick={() => {
                  setActiveSection(item.id);
                  if (isExpanded && item.subItems) {
                    toggleSection(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between rounded-xl transition-all ${
                  isExpanded ? "px-4 py-3" : "px-0 py-3 justify-center"
                } ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <item.icon />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {isExpanded && (
                    <span className="font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>
                {isExpanded && item.subItems && (
                  <div
                    className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    <Icons.ChevronDown />
                  </div>
                )}
              </button>

              {/* Sous-items */}
              {isExpanded && item.subItems && isOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveSubSection(subItem.id)}
                      className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm ${
                        activeSubSection === subItem.id
                          ? "bg-white text-gray-900"
                          : "text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <Icons.Folder />
                      <span className="whitespace-nowrap">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer avec profil */}
      <div className={`mt-auto pt-6 border-t border-gray-400 px-2 space-y-2`}>
        <button
          className={`w-full flex items-center rounded-xl text-gray-600 hover:bg-gray-300 transition-all ${
            isExpanded ? "px-4 py-3 space-x-3" : "px-0 py-3 justify-center"
          }`}
        >
          <Icons.User />
          {isExpanded && (
            <span className="font-medium whitespace-nowrap">Profil</span>
          )}
        </button>
        <button
          className={`w-full flex items-center rounded-xl text-gray-600 hover:bg-gray-300 transition-all ${
            isExpanded ? "px-4 py-3 space-x-3" : "px-0 py-3 justify-center"
          }`}
        >
          <Icons.Trash />
          {isExpanded && (
            <span className="font-medium whitespace-nowrap">Corbeille</span>
          )}
        </button>
      </div>
    </div>
  );
};

// Composant pour le contenu principal
const MainContentComponent = ({
  activeSubSection,
}: {
  activeSubSection: string;
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedProduct(null);
    setSelectedCategory(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedProduct(null);
  };

  // Contenu pour "Tous les produits" - Liste uniquement
  if (activeSubSection === "all-products") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Tous les Produits
            </h1>
          </div>
        </div>

        <ProductList
          onEdit={handleEdit}
          onView={handleView}
          refreshTrigger={refreshTrigger}
        />

        {/* Modal d'édition */}
        {selectedProduct && showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <ProductForm
                product={selectedProduct}
                onSuccess={handleFormSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}

        <ProductViewModal
          product={selectedProduct}
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProduct(null);
          }}
        />
      </div>
    );
  }

  // Contenu pour "Ajouter un produit" - Formulaire uniquement
  if (activeSubSection === "add-product") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Ajouter un Produit
          </h1>
        </div>

        <ProductForm
          product={null}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Contenu pour la section catégories
  if (activeSubSection === "categories") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Gestion des Catégories
            </h1>
            <p className="text-gray-600 mt-1">
              Organisez vos produits en catégories claires et gérables.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {showForm ? "Annuler" : "Nouvelle catégorie"}
          </button>
        </div>

        {showForm && (
          <CategoryForm
            category={selectedCategory}
            onSuccess={() => {
              setShowForm(false);
              setSelectedCategory(null);
              setRefreshTrigger((prev) => prev + 1);
            }}
            onCancel={() => {
              setShowForm(false);
              setSelectedCategory(null);
            }}
          />
        )}

        <CategoryList
          onEdit={(category: Category) => {
            setSelectedCategory(category);
            setShowForm(true);
          }}
          refreshTrigger={refreshTrigger}
        />
      </div>
    );
  }

  // Contenu par défaut
  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard Admin</h1>
      <p className="text-gray-600 mb-8">
        {activeSubSection
          ? `Section: ${activeSubSection}`
          : "Sélectionnez une option dans le menu"}
      </p>
      <div className="p-8 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-gray-700 font-semibold mb-4">
          Zone de Contenu Dynamique
        </p>
        <div className="h-96 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
          Contenu à venir pour cette section
        </div>
      </div>
    </div>
  );
};

// Composant principal
const AdminDashboardPage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [activeSubSection, setActiveSubSection] = useState("");

  return (
    <div className="h-screen bg-[#E5E7EB] flex overflow-hidden relative">
      {/* Backdrop for mobile when sidebar is open */}
      {isSidebarExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarExpanded(false)}
        />
      )}

      {/* Sidebar Collapsible */}
      <div
        className={`bg-[#C4C4C4] flex flex-col py-6 transition-all duration-300 sticky top-0 h-screen z-40 ${
          isSidebarExpanded ? "w-70" : "w-20"
        } lg:relative lg:z-auto ${
          isSidebarExpanded ? "fixed" : "hidden lg:flex"
        }`}
      >
        <CollapsibleSidebar
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          activeSubSection={activeSubSection}
          setActiveSubSection={setActiveSubSection}
        />
      </div>

      {/* Contenu Principal */}
      <main className="flex-1 p-8 overflow-y-auto h-full">
        {/* Mobile menu button */}
        {!isSidebarExpanded && (
          <button
            onClick={() => setIsSidebarExpanded(true)}
            className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
            aria-label="Ouvrir le menu"
          >
            <Icons.Menu />
          </button>
        )}

        <div className="max-w-7xl mx-auto">
          <MainContentComponent activeSubSection={activeSubSection} />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
