import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";
import { z } from "zod";

const promoCodeUpdateSchema = z.object({
  code: z.string().min(3).max(50).optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional(),
  value: z.number().min(0).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  usageLimit: z.number().min(1).nullable().optional(),
  minOrderAmount: z.number().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const permissionError = await checkApiPermission("settings.edit");
  if (permissionError) return permissionError;

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = promoCodeUpdateSchema.parse(body);

    if (validatedData.code) {
      const existing = await prisma.promoCode.findUnique({
        where: { code: validatedData.code },
      });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "Ce code promo existe déjà" },
          { status: 400 },
        );
      }
    }

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : validatedData.startDate,
        endDate: validatedData.endDate
          ? new Date(validatedData.endDate)
          : validatedData.endDate,
      },
    });

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error("Error updating promo code:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as any).errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la modification du code promo" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const permissionError = await checkApiPermission("settings.edit");
  if (permissionError) return permissionError;

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promo code:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du code promo" },
      { status: 500 },
    );
  }
}
