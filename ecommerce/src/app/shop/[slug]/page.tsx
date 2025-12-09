import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/shop/ProductDetailClient";

interface PageProps {
  params: {
    slug: string;
  };
}

// Helper for consistent slug generation - matching what we do on the client/list side
const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-");
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await Promise.resolve(params); // Handle async params

  // 1. Try to parse as ID first (backward compatibility or if slug is numeric)
  const id = parseInt(slug);
  let product = null;

  if (!isNaN(id)) {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
      },
    });
  }

  // 2. If not found by ID, try to find by Name match
  if (!product) {
    // We fetch all products (ok for small scale) and match the computed slug
    // This handles cases where specialized searching isn't available
    const allProducts = await prisma.product.findMany({
      include: { images: true, category: true },
    });

    product =
      allProducts.find((p) => {
        const pSlug = toSlug(p.name);
        return pSlug === slug;
      }) || null;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f9f5f0] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <ProductDetailClient product={product} />
    </div>
  );
}
