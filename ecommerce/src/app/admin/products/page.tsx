"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import ProductList from "@/components/admin/ProductList";
import { ProductNav } from "@/components/admin/ProductNav";
import { Product } from "@/types/admin";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      <PageHeader
        title="Produits"
        description="Gestion du catalogue produit"
        onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
      >
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          Nouveau produit
        </Link>
      </PageHeader>

      <ProductNav />

      <ProductList
        onEdit={handleEdit}
        onView={handleView}
        refreshTrigger={refreshTrigger}
        status="PUBLISHED"
      />
    </div>
  );
}
