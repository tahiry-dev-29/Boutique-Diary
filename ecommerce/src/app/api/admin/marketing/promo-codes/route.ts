import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";
import { z } from "zod";

const promoCodeSchema = z.object({
  code: z.string().min(3).max(50),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.number().min(0),
  startDate: z.string().nullable().optional(), 
  endDate: z.string().nullable().optional(), 
  usageLimit: z.number().min(1).nullable().optional(),
  minOrderAmount: z.number().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const permissionError = await checkApiPermission("settings.view");
  if (permissionError) return permissionError;

  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promoCodes);
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des codes promo" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const permissionError = await checkApiPermission("settings.edit");
  if (permissionError) return permissionError;

  try {
    const body = await req.json();
    const validatedData = promoCodeSchema.parse(body);

    const existingCode = await prisma.promoCode.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: "Ce code promo existe déjà" },
        { status: 400 },
      );
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: validatedData.code,
        type: validatedData.type,
        value: validatedData.value,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        usageLimit: validatedData.usageLimit,
        minOrderAmount: validatedData.minOrderAmount,
        isActive: validatedData.isActive ?? true,
      },
    });

    return NextResponse.json(promoCode, { status: 201 });
  } catch (error) {
    console.error("Error creating promo code:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as any).errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création du code promo" },
      { status: 500 },
    );
  }
}
