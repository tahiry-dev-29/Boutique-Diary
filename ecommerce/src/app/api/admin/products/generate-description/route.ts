import { NextRequest, NextResponse } from "next/server";
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

    const description = await GeminiService.generateQuickDescription({
      name: product.name,
      brand: product.brand || null,
      category: null,
      description: null,
      price: product.price || 0,
      colors: product.colors || [],
      sizes: product.sizes || [],
    });

    return NextResponse.json({ description });
  } catch (error) {
    console.error("[API] Description generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la description" },
      { status: 500 },
    );
  }
}
