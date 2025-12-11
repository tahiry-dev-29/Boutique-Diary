import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les paramètres du site
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      // Récupérer une clé spécifique
      const setting = await prisma.siteSettings.findUnique({
        where: { key },
      });
      return NextResponse.json(setting);
    }

    // Récupérer tous les paramètres
    const settings = await prisma.siteSettings.findMany();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 },
    );
  }
}

// POST - Créer ou mettre à jour un paramètre
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "La clé et la valeur sont requises" },
        { status: 400 },
      );
    }

    // Upsert - créer ou mettre à jour
    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du paramètre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du paramètre" },
      { status: 500 },
    );
  }
}

// DELETE - Supprimer un paramètre
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "La clé est requise" },
        { status: 400 },
      );
    }

    await prisma.siteSettings.delete({
      where: { key },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du paramètre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du paramètre" },
      { status: 500 },
    );
  }
}
