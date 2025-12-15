import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET() {
  try {
    const user = await verifyAdminToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalProducts,
      stockValueResult,
      lowStockCount,
      totalOrders,
      categoryStats,
    ] = await Promise.all([
      // Total products
      prisma.product.count(),
      // Calculate total stock value (price * stock)
      prisma.product.aggregate({
        _sum: {
          price: true,
          stock: true,
        },
      }),
      // Low stock products (less than 5)
      prisma.product.count({
        where: {
          stock: {
            lt: 5,
          },
        },
      }),
      // Mock for orders/revenue - Order model doesn't exist yet
      Promise.resolve(0),
      // Category distribution
      prisma.product.groupBy({
        by: ["categoryId"],
        _count: {
          id: true,
        },
      }),
    ]);

    // Fetch category names for distribution
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryStats
            .map(s => s.categoryId)
            .filter((id): id is number => id !== null),
        },
      },
    });

    const categoryStock = await prisma.product.groupBy({
      by: ["categoryId"],
      _sum: {
        stock: true,
      },
    });

    const categoryDistribution = categoryStats.map(stat => {
      const cat = categories.find(c => c.id === stat.categoryId);
      const stockStat = categoryStock.find(
        s => s.categoryId === stat.categoryId,
      );
      return {
        name: cat ? cat.name : "Sans catégorie",
        value: stat._count.id,
        stock: stockStat?._sum.stock || 0,
      };
    });

    const allProducts = await prisma.product.findMany({
      select: { price: true, stock: true },
    });

    const totalStockValue = allProducts.reduce((acc, p) => {
      return acc + p.price * p.stock;
    }, 0);

    return NextResponse.json(
      {
        totalProducts,
        totalStockValue,
        lowStockCount,
        totalOrders, // Placeholder
        categoryDistribution,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
