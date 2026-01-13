import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";

export async function GET() {
  const permissionError = await checkApiPermission("reports.view");
  if (permissionError) {
    return permissionError;
  }

  try {
    const topSelling = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const topProducts = await Promise.all(
      topSelling.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, reference: true, stock: true },
        });

        const orderItems = await prisma.orderItem.findMany({
          where: { productId: item.productId },
          select: { price: true, quantity: true },
        });
        const revenue = orderItems.reduce(
          (acc, curr) => acc + curr.price * curr.quantity,
          0,
        );

        return {
          id: item.productId,
          name: product?.name || "Unknown Product",
          reference: product?.reference || "-",
          totalSold: item._sum.quantity || 0,
          revenue,
          stock: product?.stock || 0,
        };
      }),
    );

    const products = await prisma.product.findMany({
      select: { stock: true, price: true },
    });

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;

    products.forEach((p) => {
      totalValue += p.price * p.stock;
      if (p.stock === 0) outOfStock++;
      else if (p.stock < 5) lowStock++;
      else inStock++;
    });

    const stockDistribution = [
      { status: "In Stock", count: inStock },
      { status: "Low Stock", count: lowStock },
      { status: "Out of Stock", count: outOfStock },
    ];

    return NextResponse.json({
      topProducts,
      stockDistribution,
      totalProducts: products.length,
      totalValue,
    });
  } catch (error) {
    console.error("Error fetching product reports:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des rapports produits" },
      { status: 500 },
    );
  }
}
