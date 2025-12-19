import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const methods = await prisma.paymentMethod.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(methods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, isActive, config, isDefault } = body;

    
    
    
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.paymentMethod.update({
      where: { id },
      data: {
        isActive,
        config,
        isDefault,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json(
      { error: "Failed to update payment method" },
      { status: 500 },
    );
  }
}
