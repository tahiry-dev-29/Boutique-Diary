import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search") || "";

    const skip = (parseInt(page) - 1) * parseInt(limit || "50");

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { reference: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const total = await prisma.product.count({ where: where as any });

    const allProducts = await prisma.product.findMany({
      where: where as any,
      select: { stock: true, price: true },
    });

    const stats = allProducts.reduce(
      (acc, p) => {
        acc.totalValue += p.stock * p.price;
        if (p.stock === 0) acc.outStock++;
        else if (p.stock < 5) acc.lowStock++;
        return acc;
      },
      { totalValue: 0, outStock: 0, lowStock: 0 },
    );

    const products = await prisma.product.findMany({
      where: where as any,
      select: {
        id: true,
        name: true,
        reference: true,
        stock: true,
        price: true,
        images: {
          select: {
            id: true,
            color: true,
            stock: true,
            url: true,
            reference: true,
          },
          orderBy: {
            id: "asc",
          },
        },
        variations: {
          select: {
            id: true,
            sku: true,
            color: true,
            size: true,
            stock: true,
          },
          orderBy: {
            id: "asc",
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: limit ? parseInt(limit) : 50,
      skip: skip,
    });

    return NextResponse.json({
      data: products,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit || "50"),
        totalPages: Math.ceil(total / parseInt(limit || "50")),
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, imageId, variationId, newStock, reason, note, type } =
      body;

    const moveType = type || "ADJUSTMENT";

    if (newStock === undefined || newStock < 0) {
      return NextResponse.json(
        { error: "Invalid stock value" },
        { status: 400 },
      );
    }

    let previousStock = 0;

    const result = await prisma.$transaction(async tx => {
      // Handle ProductVariation update
      if (variationId) {
        const variation = await tx.productVariation.findUnique({
          where: { id: variationId },
        });
        if (!variation) throw new Error("Variation not found");
        previousStock = variation.stock || 0;

        await tx.productVariation.update({
          where: { id: variationId },
          data: { stock: newStock },
        });

        // Sync to StockMovement
        await tx.stockMovement.create({
          data: {
            productId,
            type: moveType,
            quantity: newStock - previousStock,
            previousStock,
            newStock,
            reason: reason || "Manual Update",
            note: note || `Variation ${variation.sku} update`,
            createdBy: "Admin",
          },
        });

        // If this variation has a color, try to update the corresponding ProductImage stock
        if (variation.color) {
          const matchingImage = await tx.productImage.findFirst({
            where: { productId, color: variation.color },
          });

          if (matchingImage) {
            // Recalculate total stock for this color across all variations
            const allColorVariations = await tx.productVariation.findMany({
              where: { productId, color: variation.color },
              select: { stock: true },
            });
            const imageStock = allColorVariations.reduce(
              (sum, v) => sum + (v.stock || 0),
              0,
            );

            await tx.productImage.update({
              where: { id: matchingImage.id },
              data: { stock: imageStock },
            });
          }
        }

        // Always update Product total stock
        const allVariations = await tx.productVariation.findMany({
          where: { productId },
          select: { stock: true },
        });
        const totalStock = allVariations.reduce(
          (sum, v) => sum + (v.stock || 0),
          0,
        );

        await tx.product.update({
          where: { id: productId },
          data: { stock: totalStock },
        });

        return { newStock, totalStock };
      }
      // Handle ProductImage update (Color level)
      else if (imageId) {
        const img = await tx.productImage.findUnique({
          where: { id: imageId },
        });
        if (!img) throw new Error("Image not found");
        previousStock = img.stock || 0;

        await tx.stockMovement.create({
          data: {
            productId,
            productImageId: imageId,
            type: moveType,
            quantity: newStock - previousStock,
            previousStock,
            newStock,
            reason: reason || "Manual Update",
            note: note || "",
            createdBy: "Admin",
          },
        });

        await tx.productImage.update({
          where: { id: imageId },
          data: { stock: newStock },
        });

        // If we update a color's stock directly and it has variations,
        // this is tricky as we don't know which size to update.
        // For now, we update the product total.
        const siblings = await tx.productImage.findMany({
          where: { productId },
          select: { stock: true },
        });

        const totalStock = siblings.reduce((sum, s) => sum + (s.stock || 0), 0);

        await tx.product.update({
          where: { id: productId },
          data: { stock: totalStock },
        });

        return { newStock, totalStock };
      }
      // Handle simple Product update
      else if (productId) {
        const product = await tx.product.findUnique({
          where: { id: productId },
        });
        if (!product) throw new Error("Product not found");
        previousStock = product.stock;

        await tx.stockMovement.create({
          data: {
            productId,
            type: moveType,
            quantity: newStock - previousStock,
            previousStock,
            newStock,
            reason: reason || "Manual Update",
            note: note || "",
            createdBy: "Admin",
          },
        });

        await tx.product.update({
          where: { id: productId },
          data: { stock: newStock },
        });

        return { newStock };
      } else {
        throw new Error("Missing ID");
      }
    });

    console.log(
      `Updated stock for ${variationId ? "Variation " + variationId : imageId ? "Image " + imageId : "Product " + productId} to ${newStock}`,
    );

    // Revalidate front-end pages
    if (productId) {
      revalidatePath(`/store/product/${productId}`);
      revalidatePath("/shop");
      revalidatePath("/produits");
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 },
    );
  }
}
