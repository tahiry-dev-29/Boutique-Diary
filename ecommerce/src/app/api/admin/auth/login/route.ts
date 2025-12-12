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
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 },
      );
    }

    // Use Admin model for employee/admin login
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { error: "Ce compte est désactivé" },
        { status: 403 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    // Map admin role to UserPayload role type
    const roleMap: Record<string, "ADMIN" | "SUPERADMIN"> = {
      admin: "ADMIN",
      superadmin: "SUPERADMIN",
    };

    const payload: UserPayload = {
      userId: admin.id,
      username: admin.name,
      email: admin.email,
      role: roleMap[admin.role] || "ADMIN",
    };

    const token = await createToken(payload, rememberMe);

    const cookieOptions = getCookieOptions(ADMIN_SESSION_COOKIE, rememberMe);
    const response = NextResponse.json(
      {
        message: "Connexion réussie",
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
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

