"use client";

import React, { useState } from "react";
import ProductList from "@/components/admin/ProductList";
import { Product } from "@/types/admin";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Percent,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import Link from "next/link";

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
      <PageHeader title="Produits" description="Gestion du catalogue produit">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          Nouveau produit
        </Link>
      </PageHeader>

      <ProductList
        onEdit={handleEdit}
        onView={handleView}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
