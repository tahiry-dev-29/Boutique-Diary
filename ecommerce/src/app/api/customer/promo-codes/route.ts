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

// GET: List available promo codes and user's owned codes
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    // 1. Get "Shop" codes (active, purchasable, not owned by anyone specific)
    const shopCodes = await prisma.promoCode.findMany({
      where: {
        isActive: true,
        costPoints: { not: null },
        ownerId: null, // Only templates
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
      orderBy: { costPoints: "asc" },
    });

    // 2. Get "My" codes (owned by user)
    const myCodes = await prisma.promoCode.findMany({
      where: {
        ownerId: user.id,
        isActive: true, // Only show active ones? Or all? Let's show active.
        usageCount: { lt: prisma.promoCode.fields.usageLimit }, // Only unused or partially used
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Get User Points
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
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
