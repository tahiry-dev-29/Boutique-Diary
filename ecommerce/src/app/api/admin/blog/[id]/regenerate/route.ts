import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBlogContent } from "@/lib/gemini";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
          include: {
            category: { select: { name: true } },
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

    const generatedContent = await generateBlogContent({
      name: blogPost.product.name,
      description: blogPost.product.description,
      brand: blogPost.product.brand,
      category: blogPost.product.category?.name || null,
      price: blogPost.product.price,
      colors: blogPost.product.colors,
      sizes: blogPost.product.sizes,
    });

    const updatedPost = await prisma.blogPost.update({
      where: { id: blogId },
      data: {
        title: generatedContent.title,
        excerpt: generatedContent.excerpt,
        content: generatedContent.content,
        metaTitle: generatedContent.metaTitle,
        metaDescription: generatedContent.metaDescription,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contenu régénéré avec succès",
      blogPost: updatedPost,
    });
  } catch (error) {
    console.error("[Blog API] Error regenerating:", error);
    return NextResponse.json(
      { error: "Failed to regenerate blog content" },
      { status: 500 },
    );
  }
}
