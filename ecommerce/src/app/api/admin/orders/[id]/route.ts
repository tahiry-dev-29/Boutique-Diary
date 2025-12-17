import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


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
          },
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
          }
        : { name: "Invité", email: "" },
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
