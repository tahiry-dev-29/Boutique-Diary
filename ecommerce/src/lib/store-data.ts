import { prisma } from "@/lib/prisma";

export async function getFeaturedProducts(limit = 8) {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
      },
      include: {
        images: true,
        category: true,
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function getTopSellingProducts(limit = 4) {
  try {
    // Ideally filter by isBestSeller, but for now just take some
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        // isBestSeller: true, // Uncomment if populated
      },
      include: {
        images: true,
        category: true,
      },
      take: limit,
      orderBy: {
        price: "desc", // Just a different sorting for variety
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        images: true,
        category: true,
        variations: true,
      },
    });
    return product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export async function getRelatedProducts(
  categoryId: number,
  currentProductId: number,
  limit = 4,
) {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        categoryId: categoryId,
        id: {
          not: currentProductId,
        },
      },
      include: {
        images: true,
        category: true,
      },
      take: limit,
    });
    return products;
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}
