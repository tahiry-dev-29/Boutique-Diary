import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";

export async function GET() {
  const permissionError = await checkApiPermission("reports.view");
  if (permissionError) {
    return permissionError;
  }

  try {
    
    const paidOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ["DELIVERED", "COMPLETED"],
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const totalRevenue = paidOrders.reduce(
      (acc, order) => acc + order.total,
      0,
    );
    const totalOrders = paidOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    
    const allOrdersCount = await prisma.order.count();

    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = paidOrders.filter(
      order => new Date(order.createdAt) >= thirtyDaysAgo,
    );

    
    const salesByDate: Record<string, { revenue: number; orders: number }> = {};
    recentOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const key = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;

      if (!salesByDate[key]) {
        salesByDate[key] = { revenue: 0, orders: 0 };
      }
      salesByDate[key].revenue += order.total;
      salesByDate[key].orders += 1;
    });

    const chartData = Object.entries(salesByDate)
      .map(([date, data]) => ({
        date,
        amount: data.revenue,
        orders: data.orders,
        aov: data.orders > 0 ? data.revenue / data.orders : 0,
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split("/").map(Number);
        const [dayB, monthB] = b.date.split("/").map(Number);
        const dateA = new Date(new Date().getFullYear(), monthA - 1, dayA);
        const dateB = new Date(new Date().getFullYear(), monthB - 1, dayB);
        return dateA.getTime() - dateB.getTime();
      });

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        conversionRate:
          allOrdersCount > 0
            ? Math.round((totalOrders / allOrdersCount) * 100)
            : 0,
      },
      chartData,
    });
  } catch (error) {
    console.error("Error fetching sales reports:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des rapports" },
      { status: 500 },
    );
  }
}
