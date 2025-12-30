import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}


export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const blogPost = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            reference: true,
            price: true,
            brand: true,
            images: { take: 3, select: { id: true, url: true, color: true } },
            category: { select: { name: true, slug: true } },
          },
        },
      },
    });

    if (!blogPost) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    
    if (!blogPost.isPublished) {
      return NextResponse.json(
        { error: "Article not published" },
        { status: 404 },
      );
    }

    
    await prisma.blogPost.update({
      where: { id: blogPost.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error("[Public Blog API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 },
    );
  }
}
