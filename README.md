# Boutique Diary

> Modern fashion e-commerce platform — catalog, cart, orders, payments, blog and full admin dashboard. Built with Next.js 16 App Router, Prisma 7 and Neon Postgres.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748?logo=prisma)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://boutique-d.vercel.app)

**Live:** https://boutique-d.vercel.app — **DB:** Neon Postgres (`boutique-diary` / `ecommerce`)

---

## Technology Stack

| Layer | Tech | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.3.3 | `reactCompiler: true`, Edge `proxy.ts` |
| UI | React 19, Tailwind CSS 4, Radix UI, shadcn/ui, Framer Motion, Lucide | 19.2 / 4.x | `tw-animate-css`, `class-variance-authority` |
| Language | TypeScript 5, ESLint 9, Prettier 3 | 5.x | `strict: true`, `bundler` resolution |
| DB | Prisma 7 + `@prisma/adapter-pg` + `pg` 8 | 7.0.1 | `postgresql` provider, `output: src/generated/prisma` |
| DB Host | Neon Serverless Postgres | — | pooled `DATABASE_URL` + direct `DIRECT_DATABASE_URL` |
| Auth | Auth0 (`@auth0/nextjs-auth0` 4.14) + JWT (`jose` 6) + `bcryptjs` | 4.14 | `appSession` cookie, Auth0 tenant `dev-y03tbkdvslaoumys.eu.auth0.com` |
| AI | Google Gemini (`@google/generative-ai` 0.24) | 0.24 | descriptions, images, customer assistant |
| Maps | Leaflet + React-Leaflet + Google Maps API | 1.9 | geocoding, `AddressMap` |
| State | Zustand 5, SWR 2, React Hook Form + Zod | 5.x / 2.4 | cart, notifications, validation |
| PDF / Email | `jspdf` 3, `nodemailer` 7 | 3.x / 7.x | invoices, Gmail SMTP |
| Package | pnpm 10/11 | 11.18 | `onlyBuiltDependencies` + `allowBuilds` for `sharp`/`prisma` |

Alternative source: `ecommerce/package.json:20-111`, `ecommerce/prisma/schema.prisma:1-497`, `ecommerce/prisma.config.ts:1-15`.

---

## Project Architecture

```
Browser ──► Vercel Edge (proxy.ts) ──► Rate Limit ──► Auth0 middleware ──► Next.js App Router
                                      │                         │
                                      ▼                         ▼
                              /api/* (70 routes)         Server Components / Server Actions
                                      │                         │
                                      └──────────┬────────────────┘
                                                 ▼
                                        Prisma Client (src/generated/prisma)
                                                 │
                                        @prisma/adapter-pg (Pool pg)
                                                 │
                                        Neon Postgres (ecommerce, ~26 models)
                                                 │
                              Gemini / Gmail SMTP / Google Maps (external)
```

**Key patterns:**
- **App Router** with root `layout.tsx`, routes `shop`, `store`, `dashboard`, `admin`, `cart`, `checkout`, `blog`.
- **Edge Proxy** (`ecommerce/src/proxy.ts:1-42`): tiered rate limiting + Auth0. Matcher `/(?!_next/static|_next/image|favicon.ico)`.
- **Rate limiting** (`ecommerce/src/lib/rate-limit.ts`): Edge in-memory, 5 buckets (`general 100/15m`, `auth 5/15m`, `sensitive 10/h`, `ai 20/h`, `admin 60/15m`), headers `X-RateLimit-*` + `Retry-After`, `429` JSON. Upgrade path: Upstash Redis.
- **Prisma**: 26 models (`User`, `Product`, `ProductVariation`, `ProductImage`, `Category`, `Cart`, `Order`, `PaymentMethod/Transaction`, `PromoCode`, `Review`, `Wishlist`, `BlogPost`, `StoreTheme`, etc.), enums `Role`/`DiscountType`.
- **Auth**: JWT `jose` + Auth0 social (`/api/auth/social/[auth0]`), sessions, `permissions-config.ts`.
- **Images**: `next.config.ts` `remotePatterns: https/**, http/**`, `public/uploads/products`, dynamic fallback `/uploads/[...path]`.

---

## Getting Started

### Prerequisites

- Node.js 20+ / 24 (Vercel = 24.x)
- pnpm 10+ (`npm i -g pnpm`)
- Local Postgres **or** Neon (recommended for production)
- Accounts: Auth0, Google Maps, Gmail App Password, Gemini API Key

### Installation

```bash
git clone https://github.com/Vatosoaa/Boutique-Diary.git
cd Boutique-Diary/ecommerce
pnpm install
```

### Configuration

Create `ecommerce/.env` (see example `.env`):

```env
# Database — Neon (prod) or local
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/ecommerce?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/ecommerce?sslmode=require"

JWT_SECRET="..."
AUTH0_SECRET="..."
AUTH0_CLIENT_ID="..."
AUTH0_CLIENT_SECRET="..."
AUTH0_ISSUER_BASE_URL="https://dev-y03tbkdvslaoumys.eu.auth0.com"
AUTH0_DOMAIN="dev-y03tbkdvslaoumys.eu.auth0.com"
AUTH0_BASE_URL="http://localhost:3000"
APP_BASE_URL="http://localhost:3000"
AUTH0_BASE_PATH="/api/auth/social"

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
NEXT_PUBLIC_URL="http://localhost:3000"
GMAIL_USER="..."
GMAIL_APP_PASSWORD="..."
GEMINI_API_KEY="..."
```

**Vercel env (prod)**: `DATABASE_URL` = pooled Neon, `DIRECT_DATABASE_URL` = direct, `AUTH0_BASE_URL`/`APP_BASE_URL`/`NEXT_PUBLIC_URL` = `https://boutique-d.vercel.app`. Already configured via `vercel env add`.

**Auth0 Dashboard**: https://manage.auth0.com/dashboard/eu/dev-y03tbkdvslaoumys/applications → *Allowed Callback URLs* = `https://boutique-d.vercel.app/api/auth/social/callback`.

### Database

```bash
pnpm db:generate        # prisma generate
pnpm db:migrate         # prisma migrate dev (local)
pnpm db:deploy          # prisma migrate deploy (prod/Neon — port 5432 required)
pnpm db:seed            # tsx prisma/seed.ts (idempotent, deleteMany + create)
pnpm db:studio          # Prisma Studio
```

> **Network note**: if port 5432 is blocked locally, migrations/seed run during the Vercel build (`prisma generate && DATABASE_URL=$DIRECT_DATABASE_URL prisma migrate deploy && npx tsx prisma/seed.ts && next build`).

### Run

```bash
pnpm dev      # http://localhost:3000
pnpm build    # prisma generate && next build
pnpm start
pnpm lint     # eslint
pnpm format   # prettier --write .
```

---

## Project Structure

```
Boutique-Diary/
├── ecommerce/                    # Next.js app (project root)
│   ├── prisma/
│   │   ├── schema.prisma         # 26 models + enums
│   │   ├── migrations/           # 20 migrations
│   │   ├── seed.ts               # main seed (idempotent)
│   │   └── seed-payments.ts      # payment methods
│   ├── prisma.config.ts          # datasource url = env(DATABASE_URL)
│   ├── public/
│   │   └── uploads/products/     # product images (dynamic fallback)
│   ├── src/
│   │   ├── app/                  # App Router
│   │   │   ├── page.tsx          # home
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   ├── shop/ store/ blog/ cart/ checkout/ contact/
│   │   │   ├── login/ register/ forgot-password/
│   │   │   ├── dashboard/customer/  # wishlist, addresses, orders, promo-codes
│   │   │   ├── admin/            # products, orders, customers, payments, reports, blog, stock
│   │   │   ├── api/              # 70 route handlers (see below)
│   │   │   └── uploads/[...path]/route.ts
│   │   ├── components/           # ui (shadcn/radix), admin, shop, store, checkout, home
│   │   ├── lib/                  # auth0, auth, prisma, rate-limit, loyalty, email, gemini, stock-utils, theme
│   │   ├── services/ai/          # gemini-service, client-assistant-service
│   │   ├── generated/prisma/     # Prisma Client (custom output)
│   │   ├── proxy.ts              # Edge proxy + rate limiting (replaces middleware.ts)
│   │   └── types/ utils/ hooks/
│   ├── next.config.ts            # reactCompiler, remotePatterns **
│   ├── pnpm-workspace.yaml       # onlyBuiltDependencies + allowBuilds
│   └── package.json
└── README.md
```

**API routes (`src/app/api`, ~70):** `auth/*`, `admin/*` (products/generate-*, orders, stock, reports, blog, marketing), `products`, `categories`, `banners`, `blog`, `reviews`, `customer/*`, `orders`, `promo-codes`, `upload`, `geocode/reverse`, `webhooks/payments`, `assistant`, `contact`, `settings`.

---

## Key Features

- **Catalog**: products with variations (SKU, color, size, price, stock), multiple images, categories, brands, flags `isBestSeller`/`isNew`/`isPromotion`, search, filters, pagination.
- **Cart & Wishlist**: `Cart`/`CartItem` (sessionId + userId), `WishlistItem`, auto-clean.
- **Orders**: `Order`/`OrderItem`/`PaymentTransaction`, statuses, discounts, promo codes, PDF invoice generation (`jspdf`), email via `nodemailer`.
- **Payments**: `PaymentMethod`/`PaymentTransaction` (MGA), webhooks.
- **Promotions**: `PromoCode` (percentage/fixed amount, limits, points), `PromotionRule` (conditions/actions JSON, priority).
- **Reviews**: `Review` + `ReviewReply` + `ReviewReaction`, verification, admin moderation.
- **Blog**: `BlogPost` linked to `Product`/`ProductImage`, publishing, `viewCount`.
- **Store theme**: `StoreTheme` (colors, gradients, fonts, header/hero/sections JSON), `SiteSettings`, `Banner`.
- **Admin**: dashboard, product/stock management (`StockMovement`), orders, customers, employees (`Role`), contact messages, stats/reports, search, AI (description/image generation).
- **Customer**: `dashboard/customer` area (orders, addresses, wishlist, promo codes, settings), loyalty (`points`, `loyalty.ts`).
- **AI**: customer assistant (`gemini-service`), content generation, retry with backoff on 429.
- **Maps**: `AddressMap` (Leaflet), reverse geocode.
- **Security**: tiered rate limiting, Auth0 + JWT, RBAC (`permissions-config.ts`), Zod validation.

---

## Development Workflow

**Branches** (`git branch -r`): `main` (prod), `stream-update`, `feat/*`, `fix/*`, `refactor/*`. Upstream `Vatosoaa/Boutique-Diary` + origin `tahiry-dev-29/Boutique-Diary`.

```bash
git fetch upstream
git merge upstream/main   # or rebase
# feature
git checkout -b feat/my-feature
# ... dev, lint, build
git commit -m "feat(scope): message"
git push origin feat/my-feature  # PR to upstream/main
```

**Vercel deployment**: project `boutique-d` (`tahirys-projects-385468bd`), `vercel link`, `vercel env add`, `vercel --prod`. Preview deployments per PR, production on `main`. Vercel build runs migrations + seed when needed.

**Neon**: project `boutique-diary` (`noisy-dream-29917652`), `neon projects create --database ecommerce`, `neon connection-string --pooled` for runtime.

---

## Coding Standards

- **TypeScript strict**, `isolatedModules`, `bundler` resolution, alias `@/*` → `src/*`.
- **ESLint 9** (`eslint-config-next` 16.3.3) + **Prettier 3** + `eslint-config-prettier`. `pnpm lint` must pass with 0 errors (178 pre-existing warnings tolerated).
- **Conventions**: standalone components, server components by default, explicit `use client`, Zod + `react-hook-form` validation.
- **Prisma**: `prisma generate` after every `schema.prisma` change; import client from `@/generated/prisma/client` (not `@prisma/client`).
- **Commits**: conventional (`feat`, `fix`, `chore`, `refactor`). Examples: `chore(deploy): neon vercel prod setup`, `feat(security): add tiered rate limiting`.
- **pnpm**: `pnpm-workspace.yaml` must list `onlyBuiltDependencies` + `allowBuilds` for `sharp`/`prisma`/`@prisma/engines`.
- **No verbose comments** in code — self-documenting logic.

---

## Testing

No test framework is currently configured. `pnpm lint` + `pnpm exec tsc --noEmit` act as guards. Manual verification:

```bash
curl -i "https://boutique-d.vercel.app/api/products?limit=1"  # x-ratelimit-limit: 100
curl -i -X POST "https://boutique-d.vercel.app/api/auth/login" -H "Content-Type: application/json" -d '{"email":"x","password":"x"}'
# 429 after 5 attempts (auth bucket)
```

Recommended (to be added): Vitest + Playwright for unit/E2E, coverage for `proxy.ts`/`rate-limit.ts`.

---

## Contributing

1. Fork + `git clone`, `pnpm install`.
2. Create a `feat/` or `fix/` branch from `main`.
3. Follow the standards above, ensure `pnpm lint` and `pnpm exec tsc --noEmit` pass.
4. For API routes, add rate limiting if needed (`getRateLimitForPath` in `proxy.ts` or `checkRateLimitGeneric` in the handler).
5. Open a PR to `Vatosoaa/Boutique-Diary:main` with a clear description.

Exemplary references: `src/lib/rate-limit.ts` (Edge in-memory store), `src/proxy.ts` (proxy + headers pattern), `src/app/api/products/route.ts` (CRUD + Prisma).

---

## License

Not specified — see the repository owner for usage terms.

---

**Related docs**: `ecommerce/package.json` · `ecommerce/prisma/schema.prisma` · `ecommerce/src/proxy.ts` · `ecommerce/src/lib/rate-limit.ts` · `ecommerce/next.config.ts`
