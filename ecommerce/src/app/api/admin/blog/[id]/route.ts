import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: blogId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            reference: true,
            price: true,
            images: { take: 1, select: { url: true } },
          },
        },
      },
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error("[Blog API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const blogId = parseInt(id);
    const body = await request.json();

    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined)
      updateData.metaDescription = body.metaDescription;

    if (body.isPublished !== undefined) {
      updateData.isPublished = body.isPublished;
      if (body.isPublished && !body.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const blogPost = await prisma.blogPost.update({
      where: { id: blogId },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            reference: true,
            price: true,
            images: { take: 1, select: { url: true } },
          },
        },
      },
    });

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error("[Blog API] Error updating:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    await prisma.blogPost.delete({
      where: { id: blogId },
    });

    return NextResponse.json({ success: true, message: "Article supprimé" });
  } catch (error) {
    console.error("[Blog API] Error deleting:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 },
    );
  }
}
