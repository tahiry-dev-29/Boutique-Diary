import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  appBaseUrl: process.env.AUTH0_BASE_URL,
  routes: {
    login: "/api/auth/social/login",
    logout: "/api/auth/social/logout",
    callback: "/api/auth/social/callback",
  },
  authorizationParameters: {
    scope: "openid profile email",
  },
};

export const auth0 = new Auth0Client(auth0Config);
