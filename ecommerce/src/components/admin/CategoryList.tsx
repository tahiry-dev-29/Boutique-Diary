"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryListProps {
  onEdit: (category: Category) => void;
  refreshTrigger: number;
}

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

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map(word => word[0])
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
    null,
  );
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minProducts, setMinProducts] = useState("");
  const [maxProducts, setMaxProducts] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false);

      // Date filter (assuming createdAt exists)
      const createdAt = category.createdAt
        ? new Date(category.createdAt)
        : null;
      const matchesDateFrom =
        !dateFrom || (createdAt && createdAt >= new Date(dateFrom));
      const matchesDateTo =
        !dateTo || (createdAt && createdAt <= new Date(dateTo + "T23:59:59"));

      // Product count filter
      const productCount = category._count?.products || 0;
      const matchesMinProducts =
        !minProducts || productCount >= parseInt(minProducts);
      const matchesMaxProducts =
        !maxProducts || productCount <= parseInt(maxProducts);

      return (
        matchesSearch &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesMinProducts &&
        matchesMaxProducts
      );
    });
  }, [categories, searchTerm, dateFrom, dateTo, minProducts, maxProducts]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, minProducts, maxProducts]);

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
        setCategories(categories.filter(c => c.id !== id));
        toast.success("Catégorie supprimée avec succès");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8">
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune catégorie trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Liste des Catégories
          </h2>
          <span className="text-sm text-gray-500">
            ({filteredCategories.length} résultat
            {filteredCategories.length > 1 ? "s" : ""})
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 h-10 w-[200px] border-gray-200 rounded-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Date Picker Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-full transition-colors ${
                  dateFrom || dateTo
                    ? "text-indigo-600 bg-indigo-50 border-indigo-200"
                    : "text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Calendar className="w-4 h-4" />
                {dateFrom || dateTo ? "Date filtrée" : "Choisir Date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Filtrer par date
                </h4>
                <div className="grid gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-sm text-gray-600">
                      Date de début
                    </label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-gray-600">Date de fin</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                {(dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="w-full text-gray-500"
                  >
                    Effacer les dates
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors ${
                  minProducts || maxProducts
                    ? "text-white bg-indigo-600 hover:bg-indigo-700"
                    : "text-white bg-gray-900 hover:bg-gray-800"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtrer
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Filtrer par produits
                </h4>
                <div className="grid gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-sm text-gray-600">
                      Nombre min de produits
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minProducts}
                      onChange={e => setMinProducts(e.target.value)}
                      className="h-9"
                      min="0"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-gray-600">
                      Nombre max de produits
                    </label>
                    <Input
                      type="number"
                      placeholder="∞"
                      value={maxProducts}
                      onChange={e => setMaxProducts(e.target.value)}
                      className="h-9"
                      min="0"
                    />
                  </div>
                </div>
                {(minProducts || maxProducts) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMinProducts("");
                      setMaxProducts("");
                    }}
                    className="w-full text-gray-500"
                  >
                    Effacer les filtres
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {}
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
            {currentCategories.map(category => (
              <React.Fragment key={category.id}>
                <tr
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
                  onClick={() => category.id && handleRowClick(category.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {}
                      <div className="text-gray-400">
                        {expandedCategoryId === category.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                      {}
                      <div
                        className={`w-10 h-10 rounded-lg ${getInitialColor(category.name)} flex items-center justify-center text-white font-semibold text-sm`}
                      >
                        {getInitials(category.name)}
                      </div>
                      {}
                      <span className="font-medium text-gray-900 dark:text-white">
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
                        onClick={e => {
                          e.stopPropagation();
                          onEdit(category);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (category.id) handleDelete(category.id);
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

                {}
                {expandedCategoryId === category.id && (
                  <tr>
                    <td colSpan={5} className="px-0 py-0">
                      <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-900 border-t border-b border-gray-700">
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
                            <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${getInitialColor(category.name)}`}
                              ></span>
                              Produits de &quot;{category.name}&quot;
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                              {categoryProducts.map(product => (
                                <div
                                  key={product.id}
                                  className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all"
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
                                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                      <span className="text-gray-400 text-xs">
                                        N/A
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
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

      {}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-center border-t border-gray-100">
          <div className="flex items-center gap-1">
            {}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {}
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

            {}
            <button
              onClick={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
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
