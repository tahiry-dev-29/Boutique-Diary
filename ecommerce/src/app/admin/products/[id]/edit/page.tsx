import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { Product } from "@/types/admin";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: {
        orderBy: {
          id: "asc",
        },
      },
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Transform Prisma result to Admin Product type

  const serializedProduct: Product = {
    id: product.id,
    name: product.name,
    description: product.description,
    reference: product.reference,
    price: product.price, // Float in schema, number in type
    stock: product.stock,
    categoryId: product.categoryId,
    brand: product.brand,
    colors: product.colors,
    sizes: product.sizes,
    isNew: product.isNew,
    isPromotion: product.isPromotion,
    oldPrice: product.oldPrice,
    isBestSeller: product.isBestSeller,
    // Map Prisma images to ProductImage type
    images: product.images.map(img => ({
      url: img.url,
      color: img.color,
      sizes: img.sizes,
      price: img.price ?? null,
      oldPrice: img.oldPrice ?? null,
      stock: img.stock ?? 0,
      reference: img.reference || "",
      isNew: img.isNew,
      isPromotion: img.isPromotion,
      categoryId: img.categoryId,
    })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  // Fetch categories for the form
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <ProductFormWrapper product={serializedProduct} categories={categories} />
    </div>
  );
}

import ProductFormWrapper from "./ProductFormWrapper";
