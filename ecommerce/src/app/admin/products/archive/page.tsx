"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import ProductList from "@/components/admin/ProductList";
import { ProductNav } from "@/components/admin/ProductNav";
import { Product } from "@/types/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ArchivePage() {
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
      <PageHeader
        title="Archives (Brouillons)"
        description="Produits en attente de publication"
      />

      <ProductNav />

      <ProductList
        onEdit={handleEdit}
        onView={handleView}
        refreshTrigger={refreshTrigger}
        status="DRAFT"
      />
    </div>
  );
}
