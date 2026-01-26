import { prisma } from "@/lib/prisma";

/**
 * Service to handle marketing and promotion logic for customers.
 * @since 2026
 */
export class MarketingService {
  /**
   * Recalculates product prices for a specific user based on their active personalized promo code.
   * This function should be called after a promo code is activated via payment.
   *
   * @param userId The ID of the customer
   */
  static async recalculateAccountPrices(userId: number) {
    // 1. Find the active personalized promo code for this user
    const activePromo = await prisma.promoCode.findFirst({
      where: {
        ownerId: userId,
        status: "ACTIVE",
        isActive: true,
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    });

    if (!activePromo || activePromo.type !== "PERCENTAGE") {
      console.log(
        `No active percentage promo found for user ${userId}. Skipping recalculation.`,
      );
      return;
    }

    const discountPct = activePromo.value;

    // 2. Fetch all products owned by this user
    const products = await prisma.product.findMany({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (products.length === 0) {
      console.log(`User ${userId} has no products to recalculate.`);
      return;
    }

    // 3. Batch update product prices
    // We use a transaction to ensure consistency
    await prisma.$transaction(
      products.map(product => {
        // We use the original price if it was already in promotion or if we have an oldPrice
        // To avoid compounded discounts if the code is updated/renewed
        const basePrice = product.oldPrice || product.price;
        const newPrice = Math.round(basePrice * (1 - discountPct / 100));

        return prisma.product.update({
          where: { id: product.id },
          data: {
            price: newPrice,
            oldPrice: basePrice,
            isPromotion: true,
            updatedAt: new Date(),
          },
        });
      }),
    );

    console.log(
      `Successfully recalculated prices for ${products.length} products of user ${userId} with ${discountPct}% discount.`,
    );
  }

  /**
   * Reverts product prices to their original values (before promotion).
   * Useful when a promo code expires.
   */
  static async resetAccountPrices(userId: number) {
    const products = await prisma.product.findMany({
      where: {
        ownerId: userId,
        isPromotion: true,
        oldPrice: { not: null },
      },
    });

    if (products.length === 0) return;

    await prisma.$transaction(
      products.map(product => {
        return prisma.product.update({
          where: { id: product.id },
          data: {
            price: product.oldPrice!,
            oldPrice: null,
            isPromotion: false,
            updatedAt: new Date(),
          },
        });
      }),
    );

    console.log(
      `Successfully reset prices for ${products.length} products of user ${userId}.`,
    );
  }
}
