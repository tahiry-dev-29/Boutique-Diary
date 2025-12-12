"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { Product } from "@/types/admin";

import { Category } from "@/types/category";

export default function ProductFormWrapper({ product, categories }: { product: Product, categories: Category[] }) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/admin/products");
    router.refresh(); // Refresh server data
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  return (
    <ProductForm
      product={product}
      categories={categories}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
