import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const reference = (formData.get("reference") as string) || "REF";
    const productName = (formData.get("productName") as string) || "product";

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const sanitizedRef = reference.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase();
    const sanitizedName = productName
      .replace(/[^a-zA-Z0-9-]/g, "_")
      .toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);

    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      (file.type === "image/jpeg" ? "jpg" : "png");

    const fileName = `${sanitizedName}_${sanitizedRef}_${timestamp}-${random}.${extension}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

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
