"use server";

import { prisma } from "@/lib/prisma";

export async function searchStore(query: string) {
  if (!query || query.length < 2) return { products: [], categories: [] };

  try {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: { take: 1, select: { url: true } },
        category: { select: { name: true } },
      },
      take: 5,
    });

    const categories = await prisma.category.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
      },
      take: 3,
    });

    return { products, categories };
  } catch (error) {
    console.error("Search error:", error);
    return { products: [], categories: [] };
  }
}
