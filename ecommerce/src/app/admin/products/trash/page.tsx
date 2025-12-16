"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import ProductList from "@/components/admin/ProductList";
import { ProductNav } from "@/components/admin/ProductNav";
import { Product } from "@/types/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrashPage() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (product: Product) => {
    // Usually trash items are not editable until restored, but we pass it anyway
    // Or we could prevent editing in the list if deleted.
    // The list hides the edit button for deleted items anyway.
    router.push(`/admin/products/${product.id}/edit`);
  };

  const handleView = (product: Product) => {
    router.push(`/admin/products/${product.id}`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Corbeille"
        description="Produits supprimés récemment"
      />

      <ProductNav />

      <ProductList
        onEdit={handleEdit}
        onView={handleView}
        refreshTrigger={refreshTrigger}
        deleted={true}
      />
    </div>
  );
}
