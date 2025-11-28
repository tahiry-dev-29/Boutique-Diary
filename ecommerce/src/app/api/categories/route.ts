import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Fonction utilitaire pour générer un slug à partir d'un nom
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-z0-9]+/g, "-") // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ""); // Supprimer les tirets en début et fin
}

// GET - Récupérer toutes les catégories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(categories);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching categories:", error.message);
    } else {
      console.error("Error fetching categories:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validation
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Générer le slug
    const slug = generateSlug(name);

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        slug,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating category:", error);

    // Check for unique constraint violation
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code: string }).code === "string" &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
