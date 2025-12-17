import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";
import { z } from "zod";





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

    
    
    const conditions = rule.conditions as any;
    const actions = rule.actions as any;

    if (!conditions?.cart_total_gt && !conditions?.categoryId) {
      
      
      
      
      
    }

    
    const whereClause: any = {};

    
    if (conditions?.categoryId || conditions?.category_id) {
      whereClause.categoryId = parseInt(
        conditions.categoryId || conditions.category_id,
      );
    }

    
    if (conditions?.productId) {
      whereClause.id = parseInt(conditions.productId);
    }

    
    if (conditions?.reference) {
      whereClause.reference = conditions.reference;
    }

    
    if (conditions?.isBestSeller) {
      whereClause.isBestSeller = true;
    }

    
    if (conditions?.isNew) {
      whereClause.isNew = true;
    }

    
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

    
    const products = await prisma.product.findMany({
      where: whereClause,
    });

    
    let matchingImages: any[] = [];
    if (conditions?.reference) {
      matchingImages = await prisma.productImage.findMany({
        where: { reference: conditions.reference },
      });
    }

    let updatedCount = 0;
    const factor = (100 - discountPercent) / 100;

    
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

    
    for (const img of matchingImages) {
      if (img.price) {
        
        const basePrice = img.oldPrice ?? img.price;
        const newPrice = Math.round(basePrice * factor);

        await prisma.productImage.update({
          where: { id: img.id },
          data: {
            oldPrice: basePrice,
            price: newPrice,
            isPromotion: true,
            
          },
        });

        
        await prisma.product.update({
          where: { id: img.productId },
          data: {
            isPromotion: true,
            promotionRuleId: id, 
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
