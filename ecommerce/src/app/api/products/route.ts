import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const brand = searchParams.get("brand");
    const color = searchParams.get("color");
    const size = searchParams.get("size");
    const availability = searchParams.get("availability");
    const isNew = searchParams.get("isNew") === "true";
    const isPromotion = searchParams.get("isPromotion") === "true";
    const isBestSeller = searchParams.get("isBestSeller") === "true";

    const where: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { reference: { contains: search, mode: "insensitive" } },
      ];
    }

    // ... (rest of the file)

    if (categoryId && categoryId !== "all") {
      const catId = parseInt(categoryId);
      if (!isNaN(catId)) {
        where.categoryId = catId;
      } else {
        where.category = { name: categoryId };
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (brand && brand !== "all") {
      where.brand = brand;
    }

    if (color && color !== "all") {
      where.colors = { has: color };
    }

    if (size && size !== "all") {
      where.sizes = { has: size };
    }

    if (availability === "in-stock") {
      where.stock = { gt: 0 };
    } else if (availability === "out-of-stock") {
      where.stock = 0;
    }

    if (isNew) where.isNew = true;
    if (isPromotion) where.isPromotion = true;
    if (isBestSeller) where.isBestSeller = true;

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(products);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching products:", error.message);
    } else {
      console.error("Error fetching products:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

interface ProductImage {
  url: string;
  reference?: string;
  color?: string | null;
  sizes?: string[];
  price?: number | null;
  oldPrice?: number | null;
  stock?: number | null;
}

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

    if (!name || !reference || price === undefined) {
      return NextResponse.json(
        { error: "Name, reference, and price are required" },
        { status: 400 },
      );
    }

    if (price !== undefined && parseFloat(price) < 0) {
      return NextResponse.json(
        { error: "Price cannot be negative" },
        { status: 400 },
      );
    }
    if (stock !== undefined && parseInt(stock) < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 },
      );
    }

    console.log("Creating product with data:", {
      name,
      description: description || null,
      reference,
      imagesCount: images?.length || 0,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      categoryId: categoryId || null,
    });

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        reference,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        category: categoryId
          ? { connect: { id: parseInt(categoryId) } }
          : undefined,
        brand: brand || null,
        colors: colors || [],
        sizes: sizes || [],
        isNew: isNew || false,
        isPromotion: isPromotion || false,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        isBestSeller: isBestSeller || false,
        images: {
          create: (images || []).map(
            (img: string | ProductImage, index: number) => {
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
                    : img.price !== undefined &&
                        img.price !== null
                      ? img.price
                      : null,
                stock:
                  typeof img === "string"
                    ? null
                    : img.stock !== undefined &&
                        img.stock !== null
                      ? img.stock
                      : null,
              };
            },
          ),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating product:", error);

    // Check for unique constraint violation
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code: string }).code === "string" &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A product with this reference already exists" },
        { status: 409 },
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: `Failed to create product: ${errorMessage}`,
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
