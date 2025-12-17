import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/shop/ProductDetailClient";

interface PageProps {
  params: {
    slug: string;
  };
}

const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-");
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await Promise.resolve(params);

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

  if (!product) {
    const allProducts = await prisma.product.findMany({
      include: { images: true, category: true },
    });

    product =
      allProducts.find(p => {
        const pSlug = toSlug(p.name);
        return pSlug === slug;
      }) || null;
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
