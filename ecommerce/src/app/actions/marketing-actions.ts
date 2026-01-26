"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PromoCode, DiscountType } from "@/features/marketing/types";
import { verifyToken } from "@/lib/auth";
import { createCustomPromoSchema } from "@/features/marketing/promo-logic";

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
  promo?: PromoCode;
};

/**
 * Server Action to create a personalized promo code.
 * @since 2026
 */
export async function createCustomPromoAction(
  prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  // Use the standard auth verification
  const user = await verifyToken();

  // Note: verifyToken returns UserPayload { userId: number ... } not { id: number ... }
  if (!user || !user.userId) {
    return {
      success: false,
      message: "Vous devez être connecté pour créer un code.",
    };
  }

  const formDataObject = {
    codeName: formData.get("codeName") as string,
    discountType: formData.get("discountType") as string,
    discountValue: parseFloat(formData.get("discountValue") as string),
    duration: formData.get("duration") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
  };

  const validation = createCustomPromoSchema.safeParse(formDataObject);

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.issues.forEach(err => {
      if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
    });

    return {
      success: false,
      message: "Veuillez corriger les erreurs.",
      errors: fieldErrors,
    };
  }

  const { codeName, discountValue, discountType, startDate, endDate } =
    validation.data;

  const formattedCode = codeName
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, "");

  try {
    // 1. Check uniqueness
    const existing = await prisma.promoCode.findUnique({
      where: { code: formattedCode },
    });

    if (existing) {
      return {
        success: false,
        message: "Ce code est déjà pris.",
        errors: { codeName: "Veuillez choisir un autre nom." },
      };
    }

    // 2. Create PENDING promo code
    const promo = await prisma.promoCode.create({
      data: {
        code: formattedCode,
        type: discountType as DiscountType,
        value: discountValue,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId: user.userId,
        status: "PENDING",
        isActive: false,
      },
    });

    revalidatePath("/dashboard/customer/promo-codes");

    return {
      success: true,
      message: "Code promo créé ! Procédez au paiement pour l'activer.",
      promo: promo as unknown as PromoCode,
    };
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la création.",
    };
  }
}
