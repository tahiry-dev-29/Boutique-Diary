import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await context.params;
  try {
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variations: true,
        category: true,
        promotionRule: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching product:", error.message);
    } else {
      console.error("Error fetching product:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await context.params;
  try {
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      description,
      brand,
      images,
      variations,

      reference: initialReference,

      isNew,
      isBestSeller,
      isPromotion,
      promotionRuleId,
      oldPrice: initialOldPrice,
    } = body;

    const validVariations = Array.isArray(variations) ? variations : [];
    const validImages = Array.isArray(images) ? images : [];

    let globalPrice = 0;
    if (validVariations.length > 0) {
      const prices = validVariations.map((v: any) => parseFloat(v.price) || 0);
      globalPrice = Math.min(...prices);
    }

    let globalStock = 0;
    if (validVariations.length > 0) {
      globalStock = parseInt(validVariations[0].stock) || 0;
    }

    let globalCategoryId: number | null = null;
    if (validImages.length > 0) {
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

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { reference: true },
    });
    const productRef =
      initialReference || existingProduct?.reference || "PRD-UNKNOWN";

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(initialReference !== undefined && { reference: initialReference }),

        price: globalPrice,
        stock: globalStock,
        colors: Array.from(globalColors),
        sizes: Array.from(globalSizes),

        ...(brand !== undefined && { brand }),
        ...(isNew !== undefined && { isNew }),
        ...(isBestSeller !== undefined && { isBestSeller }),
        ...(isPromotion !== undefined && { isPromotion }),
        ...(promotionRuleId !== undefined && {
          promotionRule: promotionRuleId
            ? { connect: { id: parseInt(String(promotionRuleId)) } }
            : { disconnect: true },
        }),
        ...(initialOldPrice !== undefined && {
          oldPrice: initialOldPrice ? parseFloat(initialOldPrice) : null,
        }),

        ...(globalCategoryId
          ? { category: { connect: { id: globalCategoryId } } }
          : body.categoryId
            ? { category: { connect: { id: parseInt(body.categoryId) } } }
            : { category: { disconnect: true } }),

        ...(images !== undefined && {
          images: {
            deleteMany: {},
            create: (images || []).map((img: string | any, index: number) => {
              const imgColor = typeof img === "string" ? null : img.color;
              const colorAbbrev = imgColor
                ? imgColor.toLowerCase().slice(0, 3)
                : `img${index + 1}`;
              const autoReference = `${productRef}-${colorAbbrev}`;

              return {
                url: typeof img === "string" ? img : img.url,
                reference:
                  typeof img === "string"
                    ? autoReference
                    : img.reference || autoReference,
                color: imgColor ?? null,
                sizes: typeof img === "string" ? [] : (img.sizes ?? []),

                isNew: typeof img === "string" ? false : (img.isNew ?? false),
                isBestSeller:
                  typeof img === "string" ? false : (img.isBestSeller ?? false),
                isPromotion:
                  typeof img === "string" ? false : (img.isPromotion ?? false),
                promotionRuleId:
                  typeof img === "string"
                    ? null
                    : img.promotionRuleId
                      ? parseInt(String(img.promotionRuleId))
                      : null,
                categoryId:
                  typeof img === "string"
                    ? null
                    : img.categoryId
                      ? parseInt(img.categoryId)
                      : null,
              };
            }),
          },
        }),

        ...(variations !== undefined && {
          variations: {
            deleteMany: {},
            create: (variations || []).map((v: any) => ({
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
        }),
      },
      include: {
        images: true,
        variations: true,
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error("Error updating product:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code: string }).code === "string" &&
      ((error as { code: string }).code === "P2025" ||
        (error as { code: string }).code === "P2002")
    ) {
      return NextResponse.json(
        {
          error: "Product not found or reference already exists",
        },
        { status: (error as { code: string }).code === "P2025" ? 404 : 409 },
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: `Failed to update product: ${errorMessage}`,
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await context.params;
  try {
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting product:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code: string }).code === "string" &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
