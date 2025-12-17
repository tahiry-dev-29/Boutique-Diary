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

export async function getPromotionalProducts(limit = 3) {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        isPromotion: true,
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

    // Fallback if no promotions
    if (products.length < limit) {
      const fallback = await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          id: { notIn: products.map(p => p.id) },
        },
        include: { images: true, category: true },
        take: limit - products.length,
        orderBy: { createdAt: "asc" }, // Oldest or random-ish
      });
      return [...products, ...fallback];
    }
    return products;
  } catch (error) {
    console.error("Error fetching promotional products:", error);
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
        isBestSeller: true,
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

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      take: 10,
    });
    return categories;
  } catch (error) {
    return [];
  }
}

export async function getProducts(
  options: { categoryId?: number; limit?: number } = {},
) {
  try {
    const { categoryId, limit } = options;
    const where: any = {
      status: "PUBLISHED",
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: true,
        category: true,
      },
      take: limit, // undefined means return all
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getCategoryProductsMap(
  categoryNames: string[],
  limitPerCategory = 4,
) {
  try {
    const results: Record<string, any[]> = {};

    // Using Promise.all to fetch in parallel
    await Promise.all(
      categoryNames.map(async name => {
        const category = await prisma.category.findFirst({
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
        });

        if (category) {
          const products = await prisma.product.findMany({
            where: {
              categoryId: category.id,
              status: "PUBLISHED",
              deletedAt: null,
            },
            include: { images: true, category: true },
            take: limitPerCategory,
            orderBy: { createdAt: "desc" },
          });
          results[name] = products;
        } else {
          results[name] = [];
        }
      }),
    );

    return results;
  } catch (error) {
    console.error("Error fetching category map:", error);
    return {};
  }
}
