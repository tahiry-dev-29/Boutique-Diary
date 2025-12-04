import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un produit
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(reference !== undefined && { reference }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(categoryId !== undefined && { categoryId }),
        ...(brand !== undefined && { brand }),
        ...(colors !== undefined && { colors }),
        ...(sizes !== undefined && { sizes }),
        ...(isNew !== undefined && { isNew }),
        ...(isPromotion !== undefined && { isPromotion }),
        ...(isBestSeller !== undefined && { isBestSeller }),
        ...(images !== undefined && {
          images: {
            deleteMany: {},
            create: (images || []).map((img: any) => ({
              url: typeof img === "string" ? img : img.url,
              color: typeof img === "string" ? null : img.color,
              sizes: typeof img === "string" ? [] : img.sizes || [],
              price: typeof img === "string" ? null : img.price || null,
            })),
          },
        }),
      },
      include: {
        images: true,
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
        { status: (error as { code: string }).code === "P2025" ? 404 : 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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
      { status: 500 }
    );
  }
}
