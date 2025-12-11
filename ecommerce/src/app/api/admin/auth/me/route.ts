// src/app/api/admin/auth/me/route.ts
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET() {
  try {
    const user = await verifyAdminToken();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal ServerError" },
      { status: 500 },
    );
  }
}