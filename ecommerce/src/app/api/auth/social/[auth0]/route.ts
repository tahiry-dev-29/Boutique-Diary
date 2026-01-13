import { auth0, auth0Config } from "@/lib/auth0";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken, getCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const callbackAuth0 = new Auth0Client({
  ...auth0Config,
  onCallback: async (error, ctx, session) => {
    if (error) {
      console.error("Auth0 Callback Error:", error);
      return NextResponse.redirect(
        new URL("/login?error=auth_failed", process.env.AUTH0_BASE_URL!),
      );
    }

    if (session && session.user && session.user.email) {
      const { email, name, picture, nickname } = session.user;

      try {
        let user = await prisma.user.findFirst({
          where: { email },
        });

        if (!user) {
          const randomPassword = crypto.randomBytes(16).toString("hex");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          let username = nickname || name || email.split("@")[0];

          const existingUsername = await prisma.user.findFirst({
            where: { username },
          });
          if (existingUsername) {
            username = `${username}_${crypto.randomBytes(4).toString("hex")}`;
          }

          user = await prisma.user.create({
            data: {
              email,
              username,
              password: hashedPassword,
              role: "CUSTOMER",
              photo: picture,
              isActive: true,
            },
          });
        }

        const payload = {
          userId: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        };

        const token = await createToken(payload, false);
        const cookieOptions = getCookieOptions(SESSION_COOKIE, false);

        const returnUrl = ctx.returnTo || "/customer";

        console.log("Setting session cookie:", SESSION_COOKIE);

        const res = NextResponse.redirect(
          new URL(returnUrl, process.env.AUTH0_BASE_URL!),
        );
        res.cookies.set(SESSION_COOKIE, token, cookieOptions);

        return res;
      } catch (err) {
        console.error("User Sync Error:", err);
        return NextResponse.redirect(
          new URL("/login?error=sync_failed", process.env.AUTH0_BASE_URL!),
        );
      }
    }

    return NextResponse.redirect(new URL("/", process.env.AUTH0_BASE_URL!));
  },
});

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ auth0: string }> },
) => {
  const { auth0: route } = await params;

  if (route === "callback") {
    return callbackAuth0.middleware(req);
  }

  return auth0.middleware(req);
};

export const POST = (req: NextRequest) => auth0.middleware(req);
