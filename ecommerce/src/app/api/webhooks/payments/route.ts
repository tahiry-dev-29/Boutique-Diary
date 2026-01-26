import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MarketingService } from "@/services/marketing-service";

/**
 * Webhook handler to activate promo codes after payment.
 * @since 2026
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // In a real scenario, we would verify the payment provider signature here.
    // metadata should contain the promoId
    const { promoId, status, provider } = body;

    if (!promoId) {
      return NextResponse.json({ error: "Missing promoId" }, { status: 400 });
    }

    if (status === "SUCCESS") {
      const promo = await prisma.promoCode.findUnique({
        where: { id: Number(promoId) },
      });

      if (!promo) {
        return NextResponse.json(
          { error: "Promo code not found" },
          { status: 404 },
        );
      }

      // 1. Activate the code
      const updatedPromo = await prisma.promoCode.update({
        where: { id: promo.id },
        data: {
          status: "ACTIVE",
          isActive: true,
          updatedAt: new Date(),
        },
      });

      // 2. Trigger global price recalculation for the customer
      if (updatedPromo.ownerId) {
        await MarketingService.recalculateAccountPrices(updatedPromo.ownerId);
      }

      console.log(
        `Promo code ${updatedPromo.code} activated for user ${updatedPromo.ownerId} via ${provider}.`,
      );

      return NextResponse.json({
        success: true,
        message: "Code promo activé et prix recalculés.",
        code: updatedPromo.code,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Statut ${status} reçu. Aucune activation effectuée.`,
    });
  } catch (error) {
    console.error("Payment Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
