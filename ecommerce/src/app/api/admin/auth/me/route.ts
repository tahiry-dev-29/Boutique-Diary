import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";

export async function GET() {
  try {
    const user = await verifyAdminToken();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json({
      admin: {
        id: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin auth check error:", error);
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
}
