import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const limit = searchParams.get("limit");

    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId: parseInt(categoryId) } : undefined,
      include: {
        images: true,
        category: true,
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
      { status: 500 }
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
      reference,
      images,
      price,
      stock,
      categoryId,
      brand,
      colors,
      sizes,
      isNew,
      isPromotion,
      oldPrice,
      isBestSeller,
    } = body;

    if (!name || !reference) {
      return NextResponse.json(
        { error: "Name and reference are required" },
        { status: 400 }
      );
    }

    if (price !== undefined && parseFloat(price) < 0) {
      return NextResponse.json(
        { error: "Price cannot be negative" },
        { status: 400 }
      );
    }

    interface ProductImageInput {
      url: string;
      reference?: string;
      color?: string | null;
      sizes?: string[];
      price?: number | null;
      oldPrice?: number | null;
      stock?: number | null;
      isNew?: boolean;
      isPromotion?: boolean;
      categoryId?: number | null;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        reference,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        brand: brand || null,
        colors: colors || [],
        sizes: sizes || [],
        isNew: isNew || false,
        isPromotion: isPromotion || false,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        isBestSeller: isBestSeller || false,
        images: {
          create: (images || []).map(
            (img: string | ProductImageInput, index: number) => {
              const imgColor = typeof img === "string" ? null : img.color;
              const colorAbbrev = imgColor
                ? imgColor.toLowerCase().slice(0, 3)
                : `img${index + 1}`;
              const autoReference = `${reference}-${colorAbbrev}`;

              return {
                url: typeof img === "string" ? img : img.url,
                reference:
                  typeof img === "string"
                    ? autoReference
                    : img.reference || autoReference,
                color: imgColor ?? null,
                sizes: typeof img === "string" ? [] : (img.sizes ?? []),
                price:
                  typeof img === "string"
                    ? null
                    : img.price !== undefined && img.price !== null
                      ? parseFloat(String(img.price))
                      : null,
                oldPrice:
                  typeof img === "string"
                    ? null
                    : img.oldPrice !== undefined && img.oldPrice !== null
                      ? parseFloat(String(img.oldPrice))
                      : null,
                stock:
                  typeof img === "string"
                    ? null
                    : img.stock !== undefined && img.stock !== null
                      ? img.stock
                      : null,
                isNew: typeof img === "string" ? false : img.isNew ?? false,
                isPromotion:
                  typeof img === "string" ? false : img.isPromotion ?? false,
                categoryId:
                  typeof img === "string" ? null : img.categoryId ?? null,
              };
            }
          ),
        },
      },
      include: {
        images: true,
        category: true,
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
        { error: "A product with this reference already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
