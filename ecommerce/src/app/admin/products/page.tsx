"use client";

import React, { useState } from "react";
import ProductList from "@/components/admin/ProductList";
import { Product } from "@/types/admin";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (product: Product) => {
    console.log("Edit product", product);
    router.push(`/admin/products/${product.id}/edit`);
  };

  const handleView = (product: Product) => {
    router.push(`/admin/products/${product.id}`);
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
    </div>
  );
}
