import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const admin = await verifyAdminToken();

    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 },
    );
    response.cookies.set(ADMIN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    });

    if (admin) {
      await prisma.admin.update({
        where: { id: admin.adminId },
        data: {
          isOnline: false,
          lastSeen: new Date(),
        },
      });
    }

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
