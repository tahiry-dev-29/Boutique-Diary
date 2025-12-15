import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { productId, imageId, newStock, reason, note, type } = body;

    const moveType = type || "ADJUSTMENT";

    if (newStock === undefined || newStock < 0) {
      return NextResponse.json(
        { error: "Invalid stock value" },
        { status: 400 },
      );
    }

    let previousStock = 0;

    const result = await prisma.$transaction(async tx => {
      if (imageId) {
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
      } else if (productId) {
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
      `Updated stock for ${imageId ? "Image " + imageId : "Product " + productId} to ${newStock}`,
    );
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 },
    );
  }
}
