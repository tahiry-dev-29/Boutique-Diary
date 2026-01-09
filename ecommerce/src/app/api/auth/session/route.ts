import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const user = await verifyToken();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
