import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { GeminiService } from "@/services/ai/gemini-service";
import { Product } from "@/types/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = body as Product;

    if (!product.name) {
      return NextResponse.json(
        { error: "Le nom du produit est requis" },
        { status: 400 },
      );
    }

    // 1. Generate a high-quality prompt using Gemini
    const prompt = await GeminiService.generateImagePrompt({
      name: product.name,
      brand: product.brand || null,
      category: null,
      description: product.description || null,
      price: product.price || 0,
      colors: product.colors || [],
      sizes: product.sizes || [],
    });

    // 2. Generate actual image using Gemini Image API
    const imageResult = await GeminiService.generateImage(prompt);

    if (imageResult) {
      // Save image to file system
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "ai-generated",
      );
      await mkdir(uploadDir, { recursive: true });

      // Create filename
      const sanitizedName = (product.name || "product")
        .replace(/[^a-zA-Z0-9-]/g, "_")
        .toLowerCase()
        .slice(0, 30);
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 6);
      const extension = imageResult.mimeType.includes("png") ? "png" : "jpg";
      const fileName = `ai_${sanitizedName}_${timestamp}-${random}.${extension}`;

      // Decode base64 and save
      const buffer = Buffer.from(imageResult.base64, "base64");
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      // Return persistent URL
      const imageUrl = `/uploads/ai-generated/${fileName}`;

      return NextResponse.json({
        prompt: prompt,
        imageUrl: imageUrl,
        isBase64: false,
        warning: null,
      });
    }

    // Fallback: return prompt without image if generation failed
    return NextResponse.json({
      prompt: prompt,
      imageUrl: null,
      isBase64: false,
      warning: "La génération d'image a échoué. Veuillez réessayer.",
    });
  } catch (error) {
    console.error("[API] Image generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'image" },
      { status: 500 },
    );
  }
}
