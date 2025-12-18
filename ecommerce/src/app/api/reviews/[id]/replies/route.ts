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
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    // Check if it's an admin first
    const adminPayoad = await verifyAdminToken();
    if (adminPayoad) {
      const reply = await prisma.reviewReply.create({
        data: {
          content,
          reviewId,
          adminId: adminPayoad.userId as number,
        },
        include: {
          admin: {
            select: {
              name: true,
            },
          },
        },
      });
      return NextResponse.json(reply);
    }

    // If not admin, check if it's a user
    const userPayload = await verifyToken();
    if (userPayload) {
      const reply = await prisma.reviewReply.create({
        data: {
          content,
          reviewId,
          userId: userPayload.userId as number,
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });
      return NextResponse.json(reply);
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 },
    );
  }
}
