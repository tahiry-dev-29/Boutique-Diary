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

    if (products.length < limit) {
      const fallback = await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          id: { notIn: products.map((p) => p.id) },
        },
        include: { images: true, category: true },
        take: limit - products.length,
        orderBy: { createdAt: "asc" },
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
        price: "desc",
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
        blogPosts: {
          select: {
            id: true,
            slug: true,
            productImageId: true,
            title: true,
          },
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      variations: product.variations.map((v) => ({
        ...v,
        price: Number(v.price),
        oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
      })),
    };
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
  } catch {
    return [];
  }
}

export async function getProducts(
  options: {
    categoryId?: number;
    limit?: number;
    isPromotion?: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
  } = {},
) {
  try {
    const { categoryId, limit, isPromotion, isNew, isBestSeller } = options;
    const where: any = {
      status: "PUBLISHED",
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isPromotion !== undefined) {
      where.isPromotion = isPromotion;
    }

    if (isNew !== undefined) {
      where.isNew = isNew;
    }

    if (isBestSeller !== undefined) {
      where.isBestSeller = isBestSeller;
    }

    const products = await prisma.product.findMany({
      where,
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

    await Promise.all(
      categoryNames.map(async (name) => {
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
export async function getStoreStats() {
  try {
    const [customerCount, recentCustomers] = await Promise.all([
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          isActive: true,
        },
      }),
      prisma.user.findMany({
        where: {
          role: "CUSTOMER",
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          photo: true,
        },
        take: 4,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return {
      customerCount,
      recentCustomers,
    };
  } catch (error) {
    console.error("Error fetching store stats:", error);
    return {
      customerCount: 0,
      recentCustomers: [],
    };
  }
}

export async function getTestimonials(limit = 6) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        isVerified: true,
        rating: { gte: 4 },
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return reviews.map((review) => ({
      id: review.id,
      name: review.user.username,
      date: new Date(review.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
      }),
      rating: Math.floor(review.rating),
      title: review.rating >= 4.5 ? "Excellent produit" : "Très satisfait",
      review: review.comment,
    }));
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}
