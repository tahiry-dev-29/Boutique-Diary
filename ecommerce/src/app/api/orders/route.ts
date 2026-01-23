import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function generateOrderReference(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `CMD-${year}${month}${day}-${random}`;
}

interface OrderItemInput {
  productId: number;
  productImageId?: number;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

interface CreateOrderBody {
  items: OrderItemInput[];
  email: string;
  phone: string;
  address: string;
  addressComplement?: string;
  addressCoords?: { lat: number; lng: number };
  paymentMethod: string;
  mvolaPhone?: string;
  mvolaName?: string;
  promoCode?: string;
  discount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderBody = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide" },
        { status: 400 },
      );
    }

    if (!body.phone || !body.address || !body.paymentMethod) {
      return NextResponse.json(
        { error: "Informations manquantes" },
        { status: 400 },
      );
    }

    let customerId: number | null = null;
    try {
      const payload = await verifyToken();
      if (payload?.userId) {
        customerId = payload.userId as number;
      }
    } catch {}

    let total = 0;
    const stockUpdates: { productId: number; quantity: number }[] = [];

    for (const item of body.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, stock: true, name: true, price: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Produit introuvable: ${item.productId}` },
          { status: 400 },
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product.name}` },
          { status: 400 },
        );
      }

      total += item.price * item.quantity;
      stockUpdates.push({ productId: item.productId, quantity: item.quantity });
    }

    // Handle Promo Code
    let discountAmount = 0;
    let promoIdToIncrement: number | null = null;

    if (body.promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: body.promoCode.toUpperCase().trim() },
      });

      if (promo && promo.isActive) {
        // Re-calculate discount for security
        if (promo.type === "PERCENTAGE") {
          discountAmount = Math.round((total * promo.value) / 100);
        } else {
          discountAmount = promo.value;
        }

        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, total);
        promoIdToIncrement = promo.id;
      }
    }

    const finalTotal = Math.max(0, total - discountAmount);

    let reference = generateOrderReference();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.order.findUnique({ where: { reference } });
      if (!existing) break;
      reference = generateOrderReference();
      attempts++;
    }

    const order = await prisma.$transaction(async tx => {
      const newOrder = await tx.order.create({
        data: {
          reference,
          total: finalTotal,
          status: "PENDING",
          customerId,
          promoCode: body.promoCode || null,
          discount: discountAmount,
          items: {
            create: body.items.map(item => ({
              productId: item.productId,
              productImageId: item.productImageId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
          transactions: {
            create: {
              amount: finalTotal,
              currency: "MGA",
              provider: body.paymentMethod,
              status: "PENDING",
              metadata: {
                email: body.email,
                phone: body.phone,
                address: body.address,
                addressComplement: body.addressComplement,
                addressCoords: body.addressCoords,
                mvolaPhone: body.mvolaPhone,
                mvolaName: body.mvolaName,
                promoCode: body.promoCode,
                originalTotal: total,
                discount: discountAmount,
              },
            },
          },
        },
        include: {
          items: true,
          transactions: true,
        },
      });

      // Increment promo usage
      if (promoIdToIncrement) {
        await tx.promoCode.update({
          where: { id: promoIdToIncrement },
          data: { usageCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        reference: order.reference,
        total: order.total,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 },
    );
  }
}
