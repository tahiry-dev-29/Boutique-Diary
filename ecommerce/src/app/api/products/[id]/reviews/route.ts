import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            username: true,
            id: true,
            photo: true,
          },
        },
        replies: {
          include: {
            admin: { select: { name: true } },
            user: { select: { username: true, photo: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        reactions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const user = await verifyToken();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rating, comment, tags } = body;

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    if (!comment || typeof comment !== "string" || comment.length < 10) {
      return NextResponse.json(
        { error: "Comment must be at least 10 characters long" },
        { status: 400 },
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.userId,
        rating,
        comment,
        tags: tags || [],
        isVerified: true, // Assuming for now, or check if user bought product
      },
      include: {
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });

    // Update product rating average
    const aggregate = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: aggregate._avg.rating || 0,
        reviewCount: aggregate._count.rating || 0,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
