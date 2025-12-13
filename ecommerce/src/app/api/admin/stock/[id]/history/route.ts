import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const productImageId = searchParams.get("productImageId");

    // Parse IDs
    const productId = parseInt(id);
    const imgId = productImageId ? parseInt(productImageId) : null;

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const where = {
      productId,
      ...(imgId ? { productImageId: imgId } : {}),
    };

    const history = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20, // Limit history
      include: {
        // Include related info if needed?
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
