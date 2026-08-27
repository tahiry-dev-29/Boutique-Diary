import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

    const whereClause: Record<string, unknown> = {};

    // Only show deleted products if explicitly requested
    if (deleted === "true") {
      whereClause.deletedAt = { not: null };
    } else {
      // Default: show only non-deleted products
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
        blogPosts: { select: { id: true, productImageId: true } },
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
      const prices = validVariations.map(
        (v: { price: string }) => parseFloat(v.price) || 0,
      );
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
      const firstCatImg = validImages.find(
        (img: { categoryId?: string }) => img.categoryId,
      );
      if (firstCatImg) {
        globalCategoryId = parseInt(firstCatImg.categoryId!);
      }
    }

    const globalColors = new Set<string>();
    const globalSizes = new Set<string>();

    validVariations.forEach((v: { color?: string; size?: string }) => {
      if (v.color) globalColors.add(v.color);
      if (v.size) globalSizes.add(v.size);
    });

    validImages.forEach((img: { color?: string; sizes?: string[] }) => {
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
          create: validImages.map(
            (
              img: {
                url: string;
                reference?: string;
                color?: string;
                sizes?: string[];
                isNew?: boolean;
                isBestSeller?: boolean;
                isPromotion?: boolean;
                promotionRuleId?: number | string;
                categoryId?: number | string;
              },
              index: number,
            ) => ({
              url: typeof img === "string" ? img : img.url,
              reference:
                (img as { reference?: string }).reference ||
                `${globalReference}-IMG${index + 1}`,
              color: (img as { color?: string }).color || null,
              sizes: Array.isArray((img as { sizes?: string[] }).sizes)
                ? (img as { sizes?: string[] }).sizes
                : [],

              isNew: (img as { isNew?: boolean }).isNew ?? false,
              isBestSeller:
                (img as { isBestSeller?: boolean }).isBestSeller ?? false,

              isPromotion:
                (img as { isPromotion?: boolean }).isPromotion ?? false,
              promotionRuleId: (img as { promotionRuleId?: number | string })
                .promotionRuleId
                ? parseInt(
                    String(
                      (img as { promotionRuleId?: number | string })
                        .promotionRuleId,
                    ),
                  )
                : null,
              categoryId: (img as { categoryId?: number | string }).categoryId
                ? parseInt(
                    String(
                      (img as { categoryId?: number | string }).categoryId,
                    ),
                  )
                : null,
            }),
          ),
        },

        variations: {
          create: validVariations.map(
            (v: {
              sku: string;
              price: string | number;
              oldPrice?: string | number;
              stock: string | number;
              color?: string;
              size?: string;
              isActive?: boolean;
              promotionRuleId?: string | number;
            }) => ({
              sku: v.sku,
              price: parseFloat(String(v.price)) || 0,
              oldPrice: v.oldPrice ? parseFloat(String(v.oldPrice)) : null,
              stock: parseInt(String(v.stock)) || 0,
              color: v.color || null,
              size: v.size || null,
              isActive: v.isActive ?? true,
              promotionRuleId: v.promotionRuleId
                ? parseInt(String(v.promotionRuleId))
                : null,
            }),
          ),
        },
      },
      include: {
        images: true,
        category: true,
        variations: true,
      },
    });

    // Revalidate paths to ensure frontend is updated
    revalidatePath("/store/shop");
    revalidatePath("/");
    revalidatePath("/nouveautes");
    revalidatePath("/top-vente");
    revalidatePath("/promotions");
    revalidatePath("/produits");

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, data } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data,
    });

    // Revalidate for bulk update
    revalidatePath("/store/shop");
    revalidatePath("/");
    revalidatePath("/nouveautes");
    revalidatePath("/top-vente");
    revalidatePath("/promotions");
    revalidatePath("/produits");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Products API] Error bulk updating:", error);
    return NextResponse.json(
      { error: "Failed to update products" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, permanent } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    if (permanent === true) {
      await prisma.product.deleteMany({
        where: { id: { in: ids } },
      });
    } else {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Products API] Error bulk deleting:", error);
    return NextResponse.json(
      { error: "Failed to delete products" },
      { status: 500 },
    );
  }
}
