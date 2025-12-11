import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
    });

    if (!banner) {
      return NextResponse.json(
        { error: "Bannière non trouvée" },
        { status: 404 },
      );
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Erreur lors de la récupération de la bannière:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la bannière" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    const banner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: {
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        imageUrl,
        order: order !== undefined ? parseInt(String(order), 10) : undefined,
        isActive,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la bannière:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la bannière" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.banner.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Bannière supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la bannière:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la bannière" },
      { status: 500 },
    );
  }
}
