import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBlogContent, generateSlug } from "@/lib/gemini";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              reference: true,
              images: { take: 1, select: { url: true } },
            },
          },
        },
      }),
      prisma.blogPost.count(),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Blog API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productImageId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { name: true } },
        images: true,
        blogPosts: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existingPost = product.blogPosts.find((bp) =>
      productImageId
        ? bp.productImageId === productImageId
        : !bp.productImageId,
    );

    if (existingPost) {
      return NextResponse.json(
        {
          error: "Un article existe déjà pour ce produit/variante",
          existing: existingPost,
        },
        { status: 409 },
      );
    }

    let contextName = product.name;
    let contextColors = product.colors;
    let coverImage = product.images[0]?.url || null;

    if (productImageId) {
      const variantImage = product.images.find(
        (img) => img.id === productImageId,
      );
      if (variantImage) {
        if (variantImage.reference) {
          contextName = `${product.name} (${variantImage.reference})`;
        }
        if (variantImage.color) {
          contextColors = [variantImage.color];
        }
        coverImage = variantImage.url;
      }
    }

    const generatedContent = await generateBlogContent({
      name: contextName,
      description: product.description,
      brand: product.brand,
      category: product.category?.name || null,
      price: product.price,
      colors: contextColors,
      sizes: product.sizes,
    });

    let slug = generateSlug(generatedContent.title);
    let slugSuffix = 0;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slugSuffix++;
      slug = `${generateSlug(generatedContent.title)}-${slugSuffix}`;
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        title: generatedContent.title,
        slug,
        excerpt: generatedContent.excerpt,
        content: generatedContent.content,
        coverImage,
        productId: product.id,
        productImageId: productImageId || null,
        metaTitle: generatedContent.metaTitle,
        metaDescription: generatedContent.metaDescription,
        isPublished: false,
      },
      include: {
        product: {
          select: { id: true, name: true, reference: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Article généré avec succès",
      blogPost,
    });
  } catch (error) {
    console.error("[Blog API] Error generating:", error);
    return NextResponse.json(
      { error: "Failed to generate blog post" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, data } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    await prisma.blogPost.updateMany({
      where: { id: { in: ids } },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Blog API] Error bulk updating:", error);
    return NextResponse.json(
      { error: "Failed to update blog posts" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    await prisma.blogPost.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Blog API] Error bulk deleting:", error);
    return NextResponse.json(
      { error: "Failed to delete blog posts" },
      { status: 500 },
    );
  }
}
