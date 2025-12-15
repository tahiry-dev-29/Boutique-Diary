import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";
import { z } from "zod";

const jsonSchema = z.any();

const promotionRuleUpdateSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  priority: z.number().int().optional(),
  conditions: jsonSchema.optional(),
  actions: jsonSchema.optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
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
    const validatedData = promotionRuleUpdateSchema.parse(body);

    const rule = await prisma.promotionRule.update({
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

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error updating promotion rule:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as any).errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la modification de la règle" },
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

    await prisma.promotionRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promotion rule:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la règle" },
      { status: 500 },
    );
  }
}
