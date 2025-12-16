import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const limit = searchParams.get("limit");
    const isPromotion = searchParams.get("isPromotion");
    const promotionRuleId = searchParams.get("promotionRuleId");

    const whereClause: any = {};
    if (categoryId) whereClause.categoryId = parseInt(categoryId);
    if (isPromotion === "true") whereClause.isPromotion = true;
    if (promotionRuleId)
      whereClause.promotionRuleId = parseInt(promotionRuleId);

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

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      brand,
      images,
      variations,
      // Optional globals (can be derived)
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

    // 1. Validation
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // 2. Derive Global Attributes
    const validVariations = Array.isArray(variations) ? variations : [];
    const validImages = Array.isArray(images) ? images : [];

    // Global Reference
    let globalReference = initialReference;
    if (!globalReference) {
      // Generate a global reference if missing: "PRD-[RANDOM]"
      const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      globalReference = `PRD-${timestamp}${random}`;
    }

    // Global Price (Min of variations or 0)
    let globalPrice = parseFloat(initialPrice) || 0;
    if (validVariations.length > 0) {
      const prices = validVariations.map((v: any) => parseFloat(v.price) || 0);
      globalPrice = Math.min(...prices);
    }

    // Global Stock (Sum of variations or 0)
    let globalStock = parseInt(initialStock) || 0;
    if (validVariations.length > 0) {
      globalStock = validVariations.reduce(
        (sum: number, v: any) => sum + (parseInt(v.stock) || 0),
        0,
      );
    }

    // Global Category (First image's category if not set)
    let globalCategoryId = initialCategoryId
      ? parseInt(initialCategoryId)
      : null;
    if (!globalCategoryId && validImages.length > 0) {
      // Find first image with a category
      const firstCatImg = validImages.find((img: any) => img.categoryId);
      if (firstCatImg) {
        globalCategoryId = parseInt(firstCatImg.categoryId);
      }
    }

    // Global Colors & Sizes (Aggregation)
    const globalColors = new Set<string>();
    const globalSizes = new Set<string>();

    // Add from variations first (physical availability)
    validVariations.forEach((v: any) => {
      if (v.color) globalColors.add(v.color);
      if (v.size) globalSizes.add(v.size);
    });
    // Add from images (visual availability) - logic choice: should we include colors not in stock?
    // Let's include them for completeness of "Product Definition"
    validImages.forEach((img: any) => {
      if (img.color) globalColors.add(img.color);
      if (Array.isArray(img.sizes)) {
        img.sizes.forEach((s: string) => globalSizes.add(s));
      }
    });

    // 3. Create Product
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
        status: initialStatus || "PUBLISHED",

        categoryId: globalCategoryId || null,

        images: {
          create: validImages.map((img: any, index: number) => ({
            url: typeof img === "string" ? img : img.url,
            reference: img.reference || `${globalReference}-IMG${index + 1}`,
            color: img.color || null,
            sizes: Array.isArray(img.sizes) ? img.sizes : [],
            // No price/stock on image anymore, strictly visual/ref
            isNew: img.isNew ?? false,
            isBestSeller: img.isBestSeller ?? false,
            // Assuming we added it in types but maybe need migration?
            // Safer to skip unless confirmed in schema.prisma.
            // User requested it on image settings, but it's usually a global or variation property.
            // Let's check schema.prisma later if needed. For now, we skip unknown fields to avoid crash.
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
      (error as { code: string }).code === "P2002" // Unique constraint violation
    ) {
      // It might be the global reference OR a variation SKU
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
