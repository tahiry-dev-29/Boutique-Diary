// src/app/api/admin/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST() {
  try {
    // Clear the session cookie
    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
    response.cookies.set(ADMIN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}