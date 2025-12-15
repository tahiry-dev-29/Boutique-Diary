import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";

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

    // 1. Fetch the rule to know which category (optional, or we just revert all products that *would* match?)
    // Actually, "Revert" implies undoing the specific rule.
    // But since we don't store "AppliedRuleId" on product, we can only revert based on the same criteria (Category).
    // Or we revert ALL products in that category that are in promotion.

    const rule = await prisma.promotionRule.findUnique({
      where: { id },
    });

    if (!rule) {
      return NextResponse.json({ error: "Règle non trouvée" }, { status: 404 });
    }

    const conditions = rule.conditions as any;
    let targetCategoryId: number | undefined;

    const whereClause: any = {
      isPromotion: true,
      oldPrice: { not: null },
    };

    if (conditions?.categoryId || conditions?.category_id) {
      whereClause.categoryId = parseInt(
        conditions.categoryId || conditions.category_id,
      );
    }
    if (conditions?.isBestSeller) whereClause.isBestSeller = true;
    if (conditions?.isNew) whereClause.isNew = true;

    if (Object.keys(whereClause).length <= 2) {
      // checks + 2 base props
      return NextResponse.json(
        {
          error:
            "Impossible de déterminer les produits cibles pour l'annulation (Conditions manquantes).",
        },
        { status: 400 },
      );
    }

    // 2. Find matching products that have isPromotion = true
    const products = await prisma.product.findMany({
      where: whereClause,
    });

    let updatedCount = 0;

    for (const product of products) {
      if (product.oldPrice !== null) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            price: product.oldPrice,
            oldPrice: null,
            isPromotion: false,
            promotionRuleId: null,
          },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Promotion annulée sur ${updatedCount} produits.`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error reverting promotion:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation de la promotion" },
      { status: 500 },
    );
  }
}
