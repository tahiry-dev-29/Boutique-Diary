import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        photo: true,
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
      photo: customer.photo,
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
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty IDs" },
        { status: 400 },
      );
    }

    await prisma.user.deleteMany({
      where: {
        id: { in: ids },
        role: "CUSTOMER", 
      },
    });

    return NextResponse.json({
      success: true,
      count: ids.length,
    });
  } catch (error) {
    console.error("Bulk customer delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete customers" },
      { status: 500 },
    );
  }
}
import { NextRequest } from "next/server";
