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
      variations: true,
      promotionRule: true,
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
    price: product.price,
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
      reference: img.reference || "",
      isNew: img.isNew,
      isPromotion: img.isPromotion,
      promotionRuleId: (img as any).promotionRuleId,
      categoryId: img.categoryId,
      isBestSeller: (img as any).isBestSeller,
    })),
    // Map variations
    variations: product.variations.map(v => ({
      id: v.id,
      sku: v.sku,
      price: Number(v.price),
      oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
      stock: v.stock,
      color: v.color || undefined,
      size: v.size || undefined,
      isActive: v.isActive,
      promotionRuleId: v.promotionRuleId,
    })),
    promotionRuleId: product.promotionRuleId,
  };

  // Fetch categories for the form
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <ProductForm product={serializedProduct} categories={categories} />
    </div>
  );
}
