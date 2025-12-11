
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetailsView } from "@/features/products/components/ProductDetails/ProductDetailsView";

// const prisma = new PrismaClient(); // Removed local instantiation

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      images: true,
      category: true,
    },
  });

  if (!product) {
    return null;
  }

  return product;
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Serialize dates and decimals for client component
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    rating: Number(product.rating),
    images: product.images.map((img) => ({
      ...img,
      price: img.price ? Number(img.price) : null,
      oldPrice: img.oldPrice ? Number(img.oldPrice) : null,
    })),
  };

  return <ProductDetailsView product={serializedProduct} />;
}
