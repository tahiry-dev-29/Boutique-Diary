
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await verifyAdminToken();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    prisma.admin
      .update({
        where: { id: user.adminId },
        data: { lastSeen: new Date() },
      })
      .catch(err => console.error("Failed to update lastSeen:", err));

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error in /api/admin/auth/me:", error);
    return NextResponse.json(
      { error: "Internal ServerError", details: String(error) },
      { status: 500 },
    );
  }
}
