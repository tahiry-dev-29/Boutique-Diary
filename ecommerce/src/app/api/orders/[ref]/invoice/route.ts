import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) {
  try {
    const { ref } = await params;

    const order = await prisma.order.findUnique({
      where: { reference: ref },
      include: {
        customer: {
          select: {
            username: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: {
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
        transactions: {
          take: 1,
          select: {
            metadata: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    
    const invoiceData = {
      id: order.id,
      reference: order.reference,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      customer: {
        name: order.customer?.username || "Client",
        email: order.customer?.email || "",
        address:
          (order.transactions[0]?.metadata as Record<string, string>)
            ?.address || "",
      },
      items: order.items.map(item => ({
        id: item.id,
        productName: item.product.name,
        productImage: item.product.images[0]?.url || null,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    return NextResponse.json(invoiceData);
  } catch (error) {
    console.error("Invoice API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
