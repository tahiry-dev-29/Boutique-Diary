"use client";

import React, { useState, useMemo } from "react";
import ProductList from "@/components/admin/ProductList";
import { Product } from "@/types/admin";
import ProductForm from "@/components/admin/ProductForm";
import ProductViewModal from "@/components/admin/ProductViewModal";
import CategoryList from "@/components/admin/CategoryList";
import CategoryForm from "@/components/admin/CategoryForm";
import { Category } from "@/types/category";

// Icônes SVG natives
const Icons = {
  LayoutDashboard: () => (
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
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  ShoppingBag: () => (
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
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
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
  Image: () => (
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
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  CreditCard: () => (
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
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
  Settings: () => (
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
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Menu: () => (
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
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
  X: () => (
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  UserCircle: () => (
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
        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

// Composant d'icône pour les sections
const SectionIcon = ({
  icon: Icon,
  title,
  isActive,
}: {
  icon: () => React.ReactElement;
  title: string;
  isActive: boolean;
}) => (
  <div
    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 
      ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg"
          : "text-indigo-200 hover:bg-indigo-700/50 hover:text-white"
      }`}
  >
    <Icon />
    <span className="font-medium">{title}</span>
  </div>
);

// Structure de navigation
const navItems = [
  { id: "overview", title: "Vue d'ensemble", icon: Icons.LayoutDashboard },
  { id: "products", title: "Produits", icon: Icons.ShoppingBag },
  { id: "categories", title: "Catégories", icon: Icons.Folder },
  { id: "banners", title: "Bannières", icon: Icons.Image },
  { id: "payments", title: "Paiement", icon: Icons.CreditCard },
  { id: "settings", title: "Réglages", icon: Icons.Settings },
];

// Composant pour le contenu principal de chaque section
const MainContentComponent = ({ activeSection }: { activeSection: string }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const contentMap = useMemo(
    () => ({
      overview: {
        title: "Vue d'ensemble",
        text: "Bienvenue dans le tableau de bord. Consultez les statistiques clés et les notifications récentes ici.",
      },
      products: {
        title: "Gestion des Produits",
        text: "Ajoutez, modifiez ou supprimez les produits de votre boutique.",
      },
      categories: {
        title: "Gestion des Catégories",
        text: "Organisez vos produits en catégories claires et gérables.",
      },
      banners: {
        title: "Gestion des Bannières",
        text: "Configurez les bannières promotionnelles sur votre site Web.",
      },
      payments: {
        title: "Gestion des Paiements",
        text: "Visualisez l'historique des transactions et gérez les méthodes de paiement.",
      },
      settings: {
        title: "Réglages du Système",
        text: "Configurez les paramètres généraux, la sécurité et les accès utilisateurs.",
      },
    }),
    []
  );

  const currentContent = contentMap[
    activeSection as keyof typeof contentMap
  ] || {
    title: "Section Introuvable",
    text: "Veuillez sélectionner une section dans le menu.",
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedProduct(null);
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

  // Contenu spécifique pour la section produits
  if (activeSection === "products") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {currentContent.title}
            </h1>
            <p className="text-gray-600 mt-1">{currentContent.text}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
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
            {showForm ? "Annuler" : "Nouveau produit"}
          </button>
        </div>

        {showForm && (
          <ProductForm
            product={selectedProduct}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        )}

        <ProductList
          onEdit={handleEdit}
          onView={handleView}
          refreshTrigger={refreshTrigger}
        />

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

  // Contenu spécifique pour la section catégories
  if (activeSection === "categories") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {currentContent.title}
            </h1>
            <p className="text-gray-600 mt-1">{currentContent.text}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
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

  // Contenu par défaut pour les autres sections
  return (
    <div className="p-6 bg-white rounded-xl shadow-xl h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        {currentContent.title}
      </h1>
      <p className="text-gray-600">{currentContent.text}</p>
      {/* Simulation d'une zone de travail */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-700 font-semibold">Zone de Contenu Dynamique</p>
        <div className="h-64 mt-4 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
          Ici, le contenu réel de la page ({currentContent.title}) sera affiché.
        </div>
      </div>
    </div>
  );
};

// Composant Sidebar (déplacé en dehors du composant principal)
const Sidebar = ({
  activeSection,
  setActiveSection,
  setIsSidebarOpen,
}: {
  activeSection: string;
  setActiveSection: (section: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
}) => (
  <div className="flex flex-col h-full bg-indigo-900 text-white p-6 shadow-2xl">
    {/* En-tête du tableau de bord */}
    <div className="flex items-center justify-between mb-10">
      <h2 className="text-2xl font-extrabold tracking-wider">
        <span className="text-indigo-300">ADMIN</span>{" "}
        <span className="text-white">DASH</span>
      </h2>
      <button
        className="lg:hidden p-2 text-indigo-200 hover:text-white"
        onClick={() => setIsSidebarOpen(false)}
        aria-label="Fermer le menu"
      >
        <Icons.X />
      </button>
    </div>

    {/* Navigation */}
    <nav className="flex-grow space-y-2">
      {navItems.map((item) => (
        <div
          key={item.id}
          onClick={() => {
            setActiveSection(item.id);
            if (typeof window !== "undefined" && window.innerWidth < 1024)
              setIsSidebarOpen(false);
          }}
        >
          <SectionIcon
            icon={item.icon}
            title={item.title}
            isActive={activeSection === item.id}
          />
        </div>
      ))}
    </nav>

    {/* Pied de page du profil */}
    <div className="mt-auto pt-6 border-t border-indigo-700">
      <div className="flex items-center space-x-3 p-3 rounded-xl bg-indigo-800/50">
        <Icons.UserCircle />
        <div>
          <p className="text-sm font-semibold">Administrateur</p>
          <p className="text-xs text-indigo-300">john.doe@admin.com</p>
        </div>
      </div>
    </div>
  </div>
);

// Composant principal du tableau de bord
const AdminDashboardPage = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Pour le mobile

  return (
    // Conteneur principal du tableau de bord
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile : Bouton d'ouverture du menu */}
      <div className="lg:hidden fixed top-0 left-0 z-40 p-4">
        <button
          className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <Icons.Menu />
        </button>
      </div>

      {/* Sidebar - Version Mobile (Overlay) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Contenu principal */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto h-full">
            <MainContentComponent activeSection={activeSection} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
