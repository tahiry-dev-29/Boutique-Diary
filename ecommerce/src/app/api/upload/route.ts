import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 },
      );
    }

    // Créer un nom de fichier unique
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${originalName}`;

    // Chemin vers le dossier uploads dans public
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Créer le dossier s'il n'existe pas
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    // Écrire le fichier
    await writeFile(filePath, buffer);

    // Retourner l'URL relative
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url, fileName });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 },
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
