import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER", // Filter to only show actual customers
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        orders: {
          select: {
            total: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      username: customer.username,
      email: customer.email,
      createdAt: customer.createdAt,
      ordersCount: customer.orders.length,
      totalSpent: customer.orders.reduce(
        (acc, order) => acc + (order.total || 0),
        0,
      ),
    }));

    return NextResponse.json(formattedCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}
