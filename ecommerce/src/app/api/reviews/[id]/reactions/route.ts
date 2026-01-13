import { prisma } from "@/lib/prisma";
import { verifyToken, verifyAdminToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);
    const { type } = await request.json();

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    const adminPayload = await verifyAdminToken();
    const userPayload = await verifyToken();

    if (!adminPayload && !userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userPayload?.userId as number | undefined;
    const adminId = adminPayload?.userId as number | undefined;

    const existing = await prisma.reviewReaction.findFirst({
      where: {
        reviewId,
        userId: userId ?? null,
        adminId: adminId ?? null,
      },
    });

    if (existing) {
      if (existing.type === type) {
        await prisma.reviewReaction.delete({ where: { id: existing.id } });
        return NextResponse.json({ message: "Reaction removed" });
      } else {
        const updated = await prisma.reviewReaction.update({
          where: { id: existing.id },
          data: { type },
        });
        return NextResponse.json(updated);
      }
    }

    const reaction = await prisma.reviewReaction.create({
      data: {
        type,
        reviewId,
        userId: userId ?? null,
        adminId: adminId ?? null,
      },
    });

    return NextResponse.json(reaction);
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 },
    );
  }
}
