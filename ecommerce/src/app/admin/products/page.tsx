"use client";

import React, { useState } from "react";
import ProductList from "@/components/admin/ProductList";
import ProductViewModal from "@/components/admin/ProductViewModal";
import { Product } from "@/types/admin";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (product: Product) => {
    console.log("Edit product", product);
    router.push(`/admin/products/${product.id}/edit`);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        {}
      </div>

      <ProductList
        onEdit={handleEdit}
        onView={handleView}
        refreshTrigger={refreshTrigger}
      />

      {showViewModal && selectedProduct && (
        <ProductViewModal
          product={selectedProduct}
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
}
