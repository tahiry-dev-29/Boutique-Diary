import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      if (status === "completed") {
        where.status = { in: ["COMPLETED", "DELIVERED"] };
      } else if (status === "pending") {
        where.status = { in: ["PENDING", "PROCESSING"] };
      } else if (status === "cancelled") {
        where.status = "CANCELLED";
      }
    }

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { customer: { username: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          transactions: {
            take: 1,
            select: {
              metadata: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    take: 1,
                    select: { url: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalCount,
      completedCount,
      pendingCount,
      cancelledCount,
      todayCount,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { status: { in: ["COMPLETED", "DELIVERED"] } },
      }),
      prisma.order.count({
        where: { status: { in: ["PENDING", "PROCESSING"] } },
      }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
    ]);

    const formattedOrders = orders.map(order => {
      // Logic to determine customer info
      let customerName = "Invité";
      let customerEmail = "";

      if (order.customer) {
        customerName = order.customer.username;
        customerEmail = order.customer.email;
      } else if (order.transactions && order.transactions.length > 0) {
        const metadata = order.transactions[0].metadata as any;
        if (metadata) {
          // Try to get name from mvolaName or fallback to phone
          customerName =
            metadata.mvolaName || metadata.phone || metadata.email || "Invité";
          customerEmail = metadata.email || "";
        }
      }

      return {
        id: order.id,
        reference: order.reference,
        customer: {
          name: customerName,
          email: customerEmail,
        },
        status: order.status,
        total: order.total,
        itemCount: order.items.length,
        createdAt: order.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
      counts: {
        total: totalCount,
        completed: completedCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        today: todayCount,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
