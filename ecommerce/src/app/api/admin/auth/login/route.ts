import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  createAdminToken,
  getAdminCookieOptions,
  AdminPayload,
} from "@/lib/adminAuth";
import { Role } from "@/lib/auth-constants";

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

    const payload: AdminPayload = {
      adminId: admin.id,
      username: admin.name,
      email: admin.email,
      role: admin.role as Role,
    };

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        isOnline: true,
        lastSeen: new Date(),
      },
    });

    const token = await createAdminToken(payload, rememberMe);

    const cookieOptions = getAdminCookieOptions(rememberMe);
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
