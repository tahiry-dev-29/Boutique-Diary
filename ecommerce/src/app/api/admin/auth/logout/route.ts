import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { message: "Déconnexion réussie" },
    { status: 200 },
  );

  // Clear the admin session cookie
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}
