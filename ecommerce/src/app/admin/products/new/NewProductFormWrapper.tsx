"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { Category } from "@/types/category";

export default function NewProductFormWrapper({ categories }: { categories: Category[] }) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/admin/products");
    router.refresh();
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  return (
    <ProductForm
      product={null}
      categories={categories}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
