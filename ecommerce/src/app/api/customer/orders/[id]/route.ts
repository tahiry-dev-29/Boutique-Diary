import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { reduceOrderStock, replenishOrderStock } from "@/lib/stock-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await verifyToken();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { status } = body;

    
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.customerId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    
    
    if (status === "CANCELLED") {
      if (!["PENDING", "PROCESSING"].includes(order.status)) {
        return NextResponse.json(
          {
            error:
              "Impossible d'annuler cette commande car elle est déjà en cours de traitement ou expédiée.",
          },
          { status: 400 },
        );
      }
    }
    
    else if (status === "COMPLETED") {
      if (!["SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status)) {
        return NextResponse.json(
          { error: "Impossible de confirmer la réception pour le moment." },
          { status: 400 },
        );
      }

      
      if (order.status === "COMPLETED") {
        return NextResponse.json(order);
      }
    } else {
      return NextResponse.json(
        { error: "Action non autorisée" },
        { status: 400 },
      );
    }

    console.log(
      `[CustomerOrderPATCH] Updating order ${id} to status: ${status}`,
    );

    const updatedOrder = await prisma.$transaction(async tx => {
      const updatedOrderData = await tx.order.update({
        where: { id },
        data: { status },
      });
      console.log(
        `[CustomerOrderPATCH] Order updated, stockReduced: ${updatedOrderData.stockReduced}`,
      );

      if (status === "COMPLETED") {
        console.log(`[CustomerOrderPATCH] Calling reduceOrderStock for ${id}`);
        await reduceOrderStock(id, tx);
      } else if (status === "CANCELLED") {
        console.log(
          `[CustomerOrderPATCH] Calling replenishOrderStock for ${id}`,
        );
        await replenishOrderStock(id, tx);
      }

      return updatedOrderData;
    });

    console.log(`[CustomerOrderPATCH] Transaction completed successfully`);
    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("[CustomerOrderPATCH] Error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Erreur interne du serveur", details: error.message },
      { status: 500 },
    );
  }
}
