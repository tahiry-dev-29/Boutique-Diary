import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";

export async function GET() {
  const permissionError = await checkApiPermission("reports.view");
  if (permissionError) {
    return permissionError;
  }

  try {
    // 1. Top Selling Products (Aggregation on OrderItem)
    // Prisma check: GroupBy is supported.
    const topSelling = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        price: true, // This is price per item * quantity usually stored as line total? No, OrderItem usually store unit price.
        // Wait, schema says: quantity It, price Float. Assuming price is unit price at time of order.
        // Total revenue per item = sum(quantity * price). Prisma groupBy doesn't support complex calculations directly in aggregated field.
        // We'll simplisticly sum quantity first, then fetch product details.
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // Fetch product details for top selling
    const topProducts = await Promise.all(
      topSelling.map(async item => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, reference: true, stock: true },
        });

        // Approximate revenue (not perfect if price changed, but OrderItem should ideally have lineTotal if we want accuracy.
        // For now we calculate roughly or if we need precision we'd need to fetch all orderItems and sum in JS)
        // Let's do a slightly better approach: Fetch OrderItems with their prices.

        // Alternative:
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

    // 2. Stock Distribution
    const products = await prisma.product.findMany({
      select: { stock: true, price: true },
    });

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;

    products.forEach(p => {
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
