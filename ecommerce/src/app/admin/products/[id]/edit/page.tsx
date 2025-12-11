"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { Product } from "@/types/admin";
import { Loader2 } from "lucide-react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Unwrap params using React.use or await (in useEffect)
  // Since this is a client component, we use useEffect to handle the async params if needed, 
  // but Next.js 15 passes params as a Promise.
  
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
        setId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
             // Handle error (e.g. redirect or toast)
             console.error("Failed to fetch product");
             router.push("/admin/products"); 
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  const handleSuccess = () => {
    router.push("/admin/products");
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!product) {
      return null; 
  }

  return (
    <ProductForm
      product={product}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
