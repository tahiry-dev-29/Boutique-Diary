import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200 },
  );

  response.cookies.set("session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
