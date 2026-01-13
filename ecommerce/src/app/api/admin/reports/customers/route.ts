import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";

export async function GET() {
  const permissionError = await checkApiPermission("reports.view");
  if (permissionError) {
    return permissionError;
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" },
    });

    const newCustomers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const activeCustomers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
        isActive: true,
      },
    });

    const topSpenders = await prisma.order.groupBy({
      by: ["customerId"],
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      where: {
        status: { in: ["DELIVERED", "COMPLETED"] },
        customerId: { not: null },
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 5,
    });

    const topCustomers = await Promise.all(
      topSpenders.map(async (item) => {
        if (!item.customerId) return null;
        const customer = await prisma.user.findUnique({
          where: { id: item.customerId },
          select: { id: true, username: true, email: true },
        });

        return {
          id: item.customerId,
          name: customer?.username || "Inconnu",
          email: customer?.email || "-",
          totalOrders: item._count.id,
          totalSpent: item._sum.total || 0,
        };
      }),
    );

    const validTopCustomers = topCustomers.filter(
      (c): c is NonNullable<typeof c> => c !== null,
    );

    const recentUsers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    });

    const signupsByDate: Record<string, number> = {};

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      signupsByDate[dayStr] = 0;
    }

    recentUsers.forEach((u) => {
      const d = new Date(u.createdAt);
      const dayStr = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      if (signupsByDate[dayStr] !== undefined) {
        signupsByDate[dayStr]++;
      }
    });

    const recentSignups = Object.entries(signupsByDate)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => {
        const [dA, mA] = a.date.split("/").map(Number);
        const [dB, mB] = b.date.split("/").map(Number);
        return (
          new Date(new Date().getFullYear(), mA - 1, dA).getTime() -
          new Date(new Date().getFullYear(), mB - 1, dB).getTime()
        );
      });

    return NextResponse.json({
      metrics: {
        totalCustomers,
        newCustomers,
        activeCustomers,
      },
      topCustomers: validTopCustomers,
      recentSignups,
    });
  } catch (error) {
    console.error("Error fetching customer reports:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des rapports clients" },
      { status: 500 },
    );
  }
}
