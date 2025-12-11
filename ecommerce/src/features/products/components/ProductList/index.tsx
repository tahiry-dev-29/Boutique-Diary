"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/admin";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/LoadingSpinner";
import {
  ProductFilters,
  ProductFiltersState,
  initialFiltersState,
  filterProducts,
} from "./ProductFilters";
import { ProductTable } from "./ProductTable";
import { ProductPagination } from "./ProductPagination";

export interface ProductListProps {
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  refreshTrigger: number;
}

const PRODUCTS_PER_PAGE = 10;

export default function ProductList({
  onEdit,
  onView,
  refreshTrigger,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(
    null,
  );
  const [filters, setFilters] =
    useState<ProductFiltersState>(initialFiltersState);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        toast.success("Produit supprimé avec succès");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Filter products
  const filteredProducts = filterProducts(products, filters);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  if (loading) {
    return <LoadingState message="Chargement des produits..." />;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Filters */}
      <ProductFilters
        filters={filters}
        onFiltersChange={setFilters}
        products={products}
      />

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Product Table */}
        <ProductTable
          products={currentProducts}
          expandedProductId={expandedProductId}
          onToggleExpand={setExpandedProductId}
          onView={onView}
          onEdit={onEdit}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          itemsPerPage={PRODUCTS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

// Re-export components
export { ProductFilters } from "./ProductFilters";
export type { ProductFiltersState } from "./ProductFilters";
export { ProductTable } from "./ProductTable";
export { ProductPagination } from "./ProductPagination";
