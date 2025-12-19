import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const payload = await verifyToken();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: payload.userId as number },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
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

    const address = await prisma.address.create({
      data: {
        userId: payload.userId as number,
        label,
        street,
        city,
        postalCode,
        country,
        phoneNumber,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("Addresses POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
