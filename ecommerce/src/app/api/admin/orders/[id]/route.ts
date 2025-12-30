import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reduceOrderStock, replenishOrderStock } from "@/lib/stock-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            username: true,
            email: true,
            addresses: {
              take: 1,
              orderBy: { createdAt: "desc" }, // Get latest address as fallback
            },
          },
        },
        transactions: {
          take: 1,
          select: { metadata: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                reference: true,
                images: {
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Determine address
    let displayAddress = "Point relais";
    if (order.transactions && order.transactions.length > 0) {
      const meta = order.transactions[0].metadata as Record<string, unknown>;
      if (meta && typeof meta.address === "string") {
        displayAddress = meta.address;
        if (
          typeof meta.addressComplement === "string" &&
          meta.addressComplement
        ) {
          displayAddress += ` (${meta.addressComplement})`;
        }
      }
    } else if (
      order.customer &&
      order.customer.addresses &&
      order.customer.addresses.length > 0
    ) {
      // Fallback to customer's latest address
      const addr = order.customer.addresses[0];
      displayAddress = `${addr.street}, ${addr.city}`;
    }

    const formattedOrder = {
      id: order.id,
      reference: order.reference,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      customer: order.customer
        ? {
            id: order.customer.id,
            name: order.customer.username,
            email: order.customer.email,
            address: displayAddress,
          }
        : { name: "Invité", email: "", address: displayAddress },
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productRef: item.product.reference,
        productImage: item.product.images[0]?.url || null,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const allowedStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    console.log(`[OrderPATCH] Updating order ${id} to status: ${status}`);

    const updatedOrder = await prisma.$transaction(async tx => {
      const order = await tx.order.update({
        where: { id },
        data: { status },
      });
      console.log(
        `[OrderPATCH] Order updated, stockReduced: ${order.stockReduced}`,
      );

      if (status === "DELIVERED" || status === "COMPLETED") {
        console.log(`[OrderPATCH] Calling reduceOrderStock for ${id}`);
        await reduceOrderStock(id, tx);
      } else if (status === "CANCELLED") {
        console.log(`[OrderPATCH] Calling replenishOrderStock for ${id}`);
        await replenishOrderStock(id, tx);
      }

      return order;
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        error: "Failed to update order",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
