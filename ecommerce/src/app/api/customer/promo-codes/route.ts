import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Validation Schema
const createPromoSchema = {
  codeName: (name: string) =>
    name
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]/g, ""),
};

// GET: List available promo codes and user's owned codes
export async function GET() {
  const user = await verifyToken();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    // 1. Get "Shop" codes (available for purchase/exchange)
    const shopCodes = await prisma.promoCode.findMany({
      where: {
        isActive: true,
        ownerId: null, // Only show general shop codes
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
      orderBy: { costPoints: "asc" },
    });

    // 2. Get "My" codes (owned by user) - show ALL statuses
    const myCodes = await prisma.promoCode.findMany({
      where: {
        ownerId: user.userId,
        // Show all codes: PENDING, ACTIVE, EXPIRED
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Get User Points
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { points: true },
    });

    return NextResponse.json({
      points: dbUser?.points || 0,
      available: shopCodes.map(promo => ({
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value: promo.value,
        minOrderAmount: promo.minOrderAmount,
        expiresAt: promo.endDate,
        purchasePrice: promo.costPoints || 0,
        description:
          promo.type === "PERCENTAGE"
            ? `${promo.value}% de réduction sur votre commande`
            : `${promo.value.toLocaleString("fr-FR")} Ar de réduction`,
      })),
      owned: myCodes.map(promo => ({
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value: promo.value,
        minOrderAmount: promo.minOrderAmount,
        expiresAt: promo.endDate,
        status: promo.status,
        description:
          promo.type === "PERCENTAGE"
            ? `${promo.value}% de réduction`
            : `${promo.value.toLocaleString("fr-FR")} Ar off`,
      })),
    });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement" },
      { status: 500 },
    );
  }
}

// POST: Create a new PENDING custom promo code
export async function POST(request: Request) {
  const user = await verifyToken();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { codeName, startDate, endDate } = body;

    const formattedCode = createPromoSchema.codeName(codeName);

    if (formattedCode.length < 3) {
      return NextResponse.json(
        { error: "Le code est trop court (min 3 car.)" },
        { status: 400 },
      );
    }

    // 1. Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: formattedCode },
    });

    if (existing) {
      if (existing.ownerId === user.userId) {
        return NextResponse.json(
          { error: "Vous possédez déjà ce code." },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Ce code est déjà utilisé par un autre client." },
        { status: 400 },
      );
    }

    // 2. Create the PENDING promo code
    // We use a default 20% discount for personalized codes as per the standard
    const promo = await prisma.promoCode.create({
      data: {
        code: formattedCode,
        type: "PERCENTAGE",
        value: 20, // 20% discount default
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId: user.userId,
        status: "PENDING",
        isActive: false, // Inactive until payment
      },
    });

    return NextResponse.json({
      success: true,
      message: "Code promo créé en attente de paiement",
      promo,
    });
  } catch (error) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 },
    );
  }
}
