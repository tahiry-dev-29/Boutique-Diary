/* eslint-disable prettier/prettier */
"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/types/category";
import { Product } from "@/types/admin";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Edit,
  Trash2,
  Filter,
  Calendar,
} from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

interface CategoryListProps {
  onEdit: (category: Category) => void;
  refreshTrigger: number;
}

// Generate a consistent color based on category name
const getInitialColor = (name: string) => {
  const colors = [
    "bg-indigo-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-cyan-600",
    "bg-violet-600",
    "bg-pink-600",
    "bg-teal-600",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Get initials from category name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function CategoryList({
  onEdit,
  refreshTrigger,
}: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
    null
  );
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId: number) => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`/api/products?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setCategoryProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleRowClick = async (categoryId: number) => {
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null);
      setCategoryProducts([]);
    } else {
      setExpandedCategoryId(categoryId);
      await fetchProductsByCategory(categoryId);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")
    )
      return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        toast.success("Catégorie supprimée avec succès");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = categories.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune catégorie trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">
          Liste des Catégories
        </h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Choisir Date
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors">
            <Filter className="w-4 h-4" />
            Filtrer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Catégorie</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Produits</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentCategories.map((category) => (
              <React.Fragment key={category.id}>
                <tr
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
                  onClick={() => category.id && handleRowClick(category.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Expand Icon */}
                      <div className="text-gray-400">
                        {expandedCategoryId === category.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                      {/* Initial Badge */}
                      <div
                        className={`w-10 h-10 rounded-lg ${getInitialColor(category.name)} flex items-center justify-center text-white font-semibold text-sm`}
                      >
                        {getInitials(category.name)}
                      </div>
                      {/* Name */}
                      <span className="font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 text-sm truncate max-w-[200px] block">
                      {category.description || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 text-sm font-mono">
                      {category.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      {category._count?.products || 0} produits
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(category);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          category.id && handleDelete(category.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          category._count && category._count.products > 0
                        }
                        title={
                          category._count && category._count.products > 0
                            ? "Impossible de supprimer une catégorie avec des produits"
                            : "Supprimer"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Products Row */}
                {expandedCategoryId === category.id && (
                  <tr>
                    <td colSpan={5} className="px-0 py-0">
                      <div className="bg-gradient-to-r from-gray-50 to-white border-t border-b border-gray-100">
                        {loadingProducts ? (
                          <div className="text-center py-6 text-gray-500">
                            Chargement des produits...
                          </div>
                        ) : categoryProducts.length === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            Aucun produit dans cette catégorie
                          </div>
                        ) : (
                          <div className="p-5">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${getInitialColor(category.name)}`}
                              ></span>
                              Produits de &quot;{category.name}&quot;
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                              {categoryProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all"
                                >
                                  {product.images && product.images[0] ? (
                                    <img
                                      src={
                                        typeof product.images[0] === "string"
                                          ? product.images[0]
                                          : product.images[0].url
                                      }
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <span className="text-gray-400 text-xs">
                                        N/A
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {product.reference}
                                    </p>
                                    <p className="text-sm font-bold text-indigo-600">
                                      {formatPrice(product.price)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-center border-t border-gray-100">
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..."}
                className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
                  page === currentPage
                    ? "bg-indigo-600 text-white"
                    : page === "..."
                      ? "text-gray-400 cursor-default"
                      : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
