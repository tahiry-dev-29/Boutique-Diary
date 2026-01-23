import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key",
);

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: number; email: string; role: string };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { promoCodeId } = await req.json();

    if (!promoCodeId) {
      return NextResponse.json(
        { error: "ID du code promo manquant" },
        { status: 400 },
      );
    }

    // 1. Fetch the template code
    const templateCode = await prisma.promoCode.findUnique({
      where: { id: promoCodeId },
    });

    if (
      !templateCode ||
      !templateCode.isActive ||
      templateCode.costPoints === null
    ) {
      return NextResponse.json(
        { error: "Ce code promo n'est pas disponible à l'achat" },
        { status: 400 },
      );
    }

    // 2. Fetch User Points
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { points: true, email: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    if (dbUser.points < templateCode.costPoints) {
      return NextResponse.json(
        { error: "Solde de points insuffisant" },
        { status: 400 },
      );
    }

    // 3. Process Transaction
    const newCodeString = `MY-${templateCode.code}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const result = await prisma.$transaction(async tx => {
      // Deduct points
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { points: { decrement: templateCode.costPoints! } },
      });

      // Create new private code
      const newPromo = await tx.promoCode.create({
        data: {
          code: newCodeString,
          type: templateCode.type,
          value: templateCode.value,
          minOrderAmount: templateCode.minOrderAmount,
          usageLimit: 1, // One-time use
          ownerId: user.id,
          isActive: true,
          // No costPoints on the owned code, it's already bought
        },
      });

      return { newPoints: updatedUser.points, promo: newPromo };
    });

    return NextResponse.json({
      success: true,
      newPoints: result.newPoints,
      promo: {
        id: result.promo.id,
        code: result.promo.code,
        type: result.promo.type,
        value: result.promo.value,
        description:
          result.promo.type === "PERCENTAGE"
            ? `${result.promo.value}% de réduction`
            : `${result.promo.value.toLocaleString("fr-FR")} Ar off`,
      },
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'achat" },
      { status: 500 },
    );
  }
}
