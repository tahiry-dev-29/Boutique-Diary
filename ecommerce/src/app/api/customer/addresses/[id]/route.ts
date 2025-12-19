import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const payload = await verifyToken();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { label, street, city, postalCode, country, phoneNumber, isDefault } =
      body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: payload.userId as number },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: {
        id: id,
        userId: payload.userId as number,
      },
      data: {
        label,
        street,
        city,
        postalCode,
        country,
        phoneNumber,
        isDefault,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("Address PUT error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const payload = await verifyToken();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.address.delete({
      where: {
        id: id,
        userId: payload.userId as number,
      },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Address DELETE error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
