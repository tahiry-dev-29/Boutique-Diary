import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkApiPermission } from "@/lib/backend-permissions";
import { z } from "zod";


const jsonSchema = z.any();

const promotionRuleSchema = z.object({
  name: z.string().min(3).max(255),
  priority: z.number().int().default(0),
  conditions: jsonSchema, 
  actions: jsonSchema, 
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const permissionError = await checkApiPermission("settings.view");
  if (permissionError) return permissionError;

  try {
    const rules = await prisma.promotionRule.findMany({
      orderBy: [
        { priority: "desc" }, 
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching promotion rules:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des règles de promotion" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const permissionError = await checkApiPermission("settings.edit");
  if (permissionError) return permissionError;

  try {
    const body = await req.json();
    const validatedData = promotionRuleSchema.parse(body);

    const rule = await prisma.promotionRule.create({
      data: {
        name: validatedData.name,
        priority: validatedData.priority,
        conditions: validatedData.conditions,
        actions: validatedData.actions,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        isActive: validatedData.isActive ?? true,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Error creating promotion rule:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as any).errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création de la règle" },
      { status: 500 },
    );
  }
}
