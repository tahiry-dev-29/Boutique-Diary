import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau produit
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
      isBestSeller,
    } = body;

    // Validation
    if (!name || !reference || price === undefined) {
      return NextResponse.json(
        { error: "Name, reference, and price are required" },
        { status: 400 }
      );
    }

    if (price !== undefined && parseFloat(price) < 0) {
      return NextResponse.json(
        { error: "Price cannot be negative" },
        { status: 400 }
      );
    }
    if (stock !== undefined && parseInt(stock) < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    console.log("Creating product with data:", {
      name,
      description: description || null,
      reference,
      images: images || [],
      imagesLength: images?.length || 0,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      categoryId: categoryId || null,
    });

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        reference,
        images: images || [],
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId: categoryId || null,
        brand: brand || null,
        colors: colors || [],
        sizes: sizes || [],
        isNew: isNew || false,
        isPromotion: isPromotion || false,
        isBestSeller: isBestSeller || false,
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
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to create product: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
