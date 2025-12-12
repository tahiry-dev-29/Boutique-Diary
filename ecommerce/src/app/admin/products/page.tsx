"use client";

import React, { useState } from "react";
import ProductList from "@/components/admin/ProductList";
import { Product } from "@/types/admin";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductsPage() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (product: Product) => {
    router.push(`/admin/products/${product.id}/edit`);
  };

  const handleView = (product: Product) => {
    router.push(`/admin/products/${product.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => router.push('/admin/products/new')} className="bg-black text-white hover:bg-gray-800 rounded-lg gap-2 shadow-sm transition-transform active:scale-95">
           <Plus className="h-4 w-4" />
           Add Product
        </Button>
      </div>

      <ProductList
        onEdit={handleEdit}
        onView={handleView}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
