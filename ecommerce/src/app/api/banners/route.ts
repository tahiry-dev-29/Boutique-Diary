import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Récupérer toutes les bannières actives (ordonnées)
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Erreur lors de la récupération des bannières:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des bannières" },
      { status: 500 }
    );
  }
}

// POST: Créer une nouvelle bannière
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      imageUrl,
      order,
      isActive,
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Le titre et l'image sont requis" },
        { status: 400 }
      );
    }

    // Vérifier le nombre de bannières existantes (max 5)
    const count = await prisma.banner.count();
    if (count >= 5) {
      return NextResponse.json(
        { error: "Maximum 5 bannières autorisées" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        imageUrl,
        order: order ? parseInt(String(order), 10) : count + 1,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la bannière:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la bannière" },
      { status: 500 }
    );
  }
}
