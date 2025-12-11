import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  createToken,
  getCookieOptions,
  UserPayload,
  ADMIN_SESSION_COOKIE,
} from "@/lib/auth";

export async function POST(request: Request) {
  console.log("=== ADMIN LOGIN DEBUG ===");
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };
    const { email, password, rememberMe } = body;
    console.log("Email received:", email);
    console.log("Password received:", password ? "[PRESENT]" : "[MISSING]");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    console.log("User role from DB:", user.role, "Type:", typeof user.role);
    console.log(
      "Is admin check:",
      user.role === "ADMIN" || user.role === "SUPERADMIN",
    );

    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Ce compte est désactivé" },
        { status: 403 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    const payload: UserPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role as "CUSTOMER" | "EMPLOYEE" | "ADMIN" | "SUPERADMIN",
    };

    const token = await createToken(payload, rememberMe);

    const cookieOptions = getCookieOptions(ADMIN_SESSION_COOKIE, rememberMe);
    const response = NextResponse.json(
      {
        message: "Connexion réussie",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );

    response.cookies.set(cookieOptions.name, token, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 },
    );
  }
}
