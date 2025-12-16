import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const limit = searchParams.get("limit");
    const isPromotion = searchParams.get("isPromotion");
    const promotionRuleId = searchParams.get("promotionRuleId");
    const status = searchParams.get("status");
    const deleted = searchParams.get("deleted");

    const whereClause: any = {};

    // Soft Delete Logic
    if (deleted === "true") {
      whereClause.deletedAt = { not: null };
    } else {
      whereClause.deletedAt = null;
    }

    if (categoryId) whereClause.categoryId = parseInt(categoryId);
    if (isPromotion === "true") whereClause.isPromotion = true;
    if (promotionRuleId)
      whereClause.promotionRuleId = parseInt(promotionRuleId);
    if (status) whereClause.status = status;

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        category: true,
        promotionRule: true,
        variations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return NextResponse.json(products);
  } catch (error: unknown) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      brand,
      images,
      variations,

      reference: initialReference,
      price: initialPrice,
      stock: initialStock,
      categoryId: initialCategoryId,
      isNew: initialIsNew,
      isBestSeller: initialIsBestSeller,
      isPromotion: initialIsPromotion,
      promotionRuleId,
      status: initialStatus,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const validVariations = Array.isArray(variations) ? variations : [];
    const validImages = Array.isArray(images) ? images : [];

    let globalReference = initialReference;
    if (!globalReference) {
      const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      globalReference = `PRD-${timestamp}${random}`;
    }

    let globalPrice = parseFloat(initialPrice) || 0;
    if (validVariations.length > 0) {
      const prices = validVariations.map((v: any) => parseFloat(v.price) || 0);
      globalPrice = Math.min(...prices);
    }

    let globalStock = parseInt(initialStock) || 0;
    if (validVariations.length > 0) {
      globalStock = parseInt(validVariations[0].stock) || 0;
    }

    let globalCategoryId = initialCategoryId
      ? parseInt(initialCategoryId)
      : null;
    if (!globalCategoryId && validImages.length > 0) {
      const firstCatImg = validImages.find((img: any) => img.categoryId);
      if (firstCatImg) {
        globalCategoryId = parseInt(firstCatImg.categoryId);
      }
    }

    const globalColors = new Set<string>();
    const globalSizes = new Set<string>();

    validVariations.forEach((v: any) => {
      if (v.color) globalColors.add(v.color);
      if (v.size) globalSizes.add(v.size);
    });

    validImages.forEach((img: any) => {
      if (img.color) globalColors.add(img.color);
      if (Array.isArray(img.sizes)) {
        img.sizes.forEach((s: string) => globalSizes.add(s));
      }
    });

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        reference: globalReference,
        price: globalPrice,
        stock: globalStock,
        brand: brand || null,
        colors: Array.from(globalColors),
        sizes: Array.from(globalSizes),
        isNew: initialIsNew || false,
        isBestSeller: initialIsBestSeller || false,
        isPromotion: initialIsPromotion || false,
        promotionRuleId: promotionRuleId ? parseInt(promotionRuleId) : null,
        status: initialStatus || "DRAFT",

        categoryId: globalCategoryId || null,

        images: {
          create: validImages.map((img: any, index: number) => ({
            url: typeof img === "string" ? img : img.url,
            reference: img.reference || `${globalReference}-IMG${index + 1}`,
            color: img.color || null,
            sizes: Array.isArray(img.sizes) ? img.sizes : [],

            isNew: img.isNew ?? false,
            isBestSeller: img.isBestSeller ?? false,

            isPromotion: img.isPromotion ?? false,
            promotionRuleId: img.promotionRuleId
              ? parseInt(img.promotionRuleId)
              : null,
            categoryId: img.categoryId ? parseInt(img.categoryId) : null,
          })),
        },

        variations: {
          create: validVariations.map((v: any) => ({
            sku: v.sku,
            price: parseFloat(v.price) || 0,
            oldPrice: v.oldPrice ? parseFloat(v.oldPrice) : null,
            stock: parseInt(v.stock) || 0,
            color: v.color || null,
            size: v.size || null,
            isActive: v.isActive ?? true,
            promotionRuleId: v.promotionRuleId
              ? parseInt(v.promotionRuleId)
              : null,
          })),
        },
      },
      include: {
        images: true,
        category: true,
        variations: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating product:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "A product or variation with this reference/SKU already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
