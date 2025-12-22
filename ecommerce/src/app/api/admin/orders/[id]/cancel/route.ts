import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    
    if (!["PENDING", "PROCESSING"].includes(order.status)) {
      return NextResponse.json(
        { error: "Cette commande ne peut pas être annulée" },
        { status: 400 },
      );
    }

    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 },
    );
  }
}
