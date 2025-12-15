import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";
import { z } from "zod";

// MVP: Only support Category conditions for now
// Example condition: { "categoryId": 5 }
// Example action: { "discountPercentage": 20 }

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const permissionError = await checkApiPermission("settings.edit");
  if (permissionError) return permissionError;

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // 1. Fetch the rule
    const rule = await prisma.promotionRule.findUnique({
      where: { id },
    });

    if (!rule) {
      return NextResponse.json({ error: "Règle non trouvée" }, { status: 404 });
    }

    if (!rule.isActive) {
      return NextResponse.json(
        { error: "La règle n'est pas active" },
        { status: 400 },
      );
    }

    // 2. Parse conditions and actions
    // JSON type in Prisma relies on runtime validation
    const conditions = rule.conditions as any;
    const actions = rule.actions as any;

    if (!conditions?.cart_total_gt && !conditions?.categoryId) {
      // For catalog rules, we need a product-targeting condition.
      // If it's a cart rule (like total > 100), we can't apply it to catalog price.
      // But for MVP we agreed to simulate applying to category.
      // If empty conditions, we probably shouldn't apply to ALL products safely?
      // Let's assume if categoryId is present in conditions, we apply.
    }

    // 3. Build dynamic where clause
    const whereClause: any = {};

    // Check for Category
    if (conditions?.categoryId || conditions?.category_id) {
      whereClause.categoryId = parseInt(
        conditions.categoryId || conditions.category_id,
      );
    }

    // Check for Specific Product ID
    if (conditions?.productId) {
      whereClause.id = parseInt(conditions.productId);
    }

    // Check for Reference
    if (conditions?.reference) {
      whereClause.reference = conditions.reference;
    }

    // Check for Best Seller
    if (conditions?.isBestSeller) {
      whereClause.isBestSeller = true;
    }

    // Check for New
    if (conditions?.isNew) {
      whereClause.isNew = true;
    }

    // Safety: Require at least one filtering condition
    if (Object.keys(whereClause).length === 0) {
      return NextResponse.json(
        {
          error:
            "La règle doit avoir au moins une condition de ciblage (Produit, Référence, Catégorie, Nouveauté, Best-seller).",
        },
        { status: 400 },
      );
    }

    let discountPercent = 0;
    if (actions?.discountPercentage) {
      discountPercent = parseFloat(actions.discountPercentage);
    } else if (actions?.percentage) {
      discountPercent = parseFloat(actions.percentage);
    } else if (actions?.discount_percent) {
      discountPercent = parseFloat(actions.discount_percent);
    }

    if (!discountPercent || discountPercent <= 0) {
      return NextResponse.json(
        {
          error: "Action de réduction en pourcentage non trouvée ou invalide.",
        },
        { status: 400 },
      );
    }

    // Find matching products
    const products = await prisma.product.findMany({
      where: whereClause,
    });

    // Also look for matching ProductImages if reference targeting is used
    let matchingImages: any[] = [];
    if (conditions?.reference) {
      matchingImages = await prisma.productImage.findMany({
        where: { reference: conditions.reference },
      });
    }

    let updatedCount = 0;
    const factor = (100 - discountPercent) / 100;

    // 4. Update Main Products
    for (const product of products) {
      const basePrice = product.oldPrice ?? product.price;
      const newPrice = Math.round(basePrice * factor);

      await prisma.product.update({
        where: { id: product.id },
        data: {
          oldPrice: basePrice,
          price: newPrice,
          isPromotion: true,
          promotionRuleId: id,
        },
      });
      updatedCount++;
    }

    // 5. Update Matching Images (Variants)
    for (const img of matchingImages) {
      if (img.price) {
        // Only update if price exists
        const basePrice = img.oldPrice ?? img.price;
        const newPrice = Math.round(basePrice * factor);

        await prisma.productImage.update({
          where: { id: img.id },
          data: {
            oldPrice: basePrice,
            price: newPrice,
            isPromotion: true,
            // Note: ProductImage has no promotionRuleId in schema, so we rely on linking parent product or just matching logic
          },
        });

        // Ensure parent product is marked as promotion so it shows in lists (even if main price isn't changed)
        await prisma.product.update({
          where: { id: img.productId },
          data: {
            isPromotion: true,
            promotionRuleId: id, // Link rule to parent for filtering
          },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Promotion appliquée sur ${updatedCount} produits de la catégorie.`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error applying promotion:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'application de la promotion" },
      { status: 500 },
    );
  }
}
