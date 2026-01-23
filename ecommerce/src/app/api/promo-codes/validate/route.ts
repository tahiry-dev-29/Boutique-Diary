"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const validateSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  cartTotal: z.number().min(0),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, cartTotal } = validateSchema.parse(body);

    // Find promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promoCode) {
      return NextResponse.json(
        { valid: false, message: "Code promo introuvable" },
        { status: 200 },
      );
    }

    // Check if active
    if (!promoCode.isActive) {
      return NextResponse.json(
        { valid: false, message: "Ce code promo n'est plus actif" },
        { status: 200 },
      );
    }

    // Check date validity
    const now = new Date();
    if (promoCode.startDate && now < promoCode.startDate) {
      return NextResponse.json(
        { valid: false, message: "Ce code promo n'est pas encore valide" },
        { status: 200 },
      );
    }
    if (promoCode.endDate && now > promoCode.endDate) {
      return NextResponse.json(
        { valid: false, message: "Ce code promo a expiré" },
        { status: 200 },
      );
    }

    // Check usage limit
    if (
      promoCode.usageLimit !== null &&
      promoCode.usageCount >= promoCode.usageLimit
    ) {
      return NextResponse.json(
        {
          valid: false,
          message: "Ce code promo a atteint sa limite d'utilisation",
        },
        { status: 200 },
      );
    }

    // Check minimum order amount
    if (
      promoCode.minOrderAmount !== null &&
      cartTotal < promoCode.minOrderAmount
    ) {
      return NextResponse.json(
        {
          valid: false,
          message: `Montant minimum requis: ${promoCode.minOrderAmount.toLocaleString("fr-FR")} Ar`,
        },
        { status: 200 },
      );
    }

    // Calculate discount
    let discount = 0;
    if (promoCode.type === "PERCENTAGE") {
      discount = (cartTotal * promoCode.value) / 100;
    } else {
      discount = Math.min(promoCode.value, cartTotal); // Don't exceed cart total
    }

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      discount: Math.round(discount),
      message:
        promoCode.type === "PERCENTAGE"
          ? `-${promoCode.value}% appliqué`
          : `-${promoCode.value.toLocaleString("fr-FR")} Ar appliqué`,
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, message: "Données invalides" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { valid: false, message: "Erreur lors de la validation" },
      { status: 500 },
    );
  }
}
