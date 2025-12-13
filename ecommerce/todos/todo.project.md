C'est parti Tahiry ! Voici la **Feuille de route technique complète**, adaptée pour la stack **Next.js**, formatée exactement selon ton style.

C'est une "Checklist de Combat" pour un clone PrestaShop sérieux (Headless Commerce). Copie-colle ça dans ton Obsidian ou ton gestionnaire de tâches. 🚀

---

# #Backend (NestJS + Prisma)

_(Cette partie reste inchangée car ton API NestJS sert de source de vérité pour le Next.js)_

### 🛠️ Setup & Infrastructure

- [] Initialiser le Monorepo N (`np create-n-workspace`).
- [] Configurer l'application NestJS `api-store`.
- [] Créer la librairie partagée `libs/shared/db-schema`.
- [] Installer et configurer Prisma avec PostgreSQL (`provider = "prisma-client-js"`).
- [ ] Configurer le Docker Compose pour la base de données PostgreSQL.
- [ ] Mettre en place le ConfigService (Gestion des variables d'environnement).

### 🔐 Auth & ACL (Employee & Customer)

- [x] Créer le modèle Prisma `Profile` (Rôles Admin) et `Employee`.
- [x] Créer le modèle Prisma `Customer` et `CustomerGroup`.
- [x] Créer la librairie NestJS `libs/api/auth` (Adapté: `lib/auth` & `lib/adminAuth`).
- [x] Implémenter le service de Hashage (Argon2) (Adapté: `bcryptjs`).
- [x] Implémenter la stratégie JWT (Passport) pour `Employee` (Back-Office) (Adapté: `jose`).
- [x] Implémenter la stratégie JWT pour `Customer` (Front-Office).
- [x] Créer les Guards : `JwtAuthGuard`, `RolesGuard` (Adapté: RBAC middleware & hooks).
- [x] Créer le Decorator `@CurrentUser()` pour récupérer l'utilisateur depuis le Request (Adapté: `verifyToken`).
- [x] Endpoint: `auth/employee/login`.
- [x] Endpoint: `auth/customer/register` (avec assignation de groupe par défaut).
- [x] Endpoint: `auth/customer/login`.

### 📦 Products Core (Le gros morceau)

- [x] Modèle Prisma `Product` (Champs de base + `ProductLang` pour i18n).
- [x] Modèle Prisma `ProductCombination` (Variantes).
- [x] Modèle Prisma `Stock` (Lié au produit OU à la combinaison).
- [x] Modèle Prisma `Image` (Gestion des médias).
- [x] DTO `CreateProductInput` (Complet: incluant features et infos de base).
- [x] Service `ProductService`: Création de produit simple.
- [x] Service `ProductVariantService`: Générateur de combinaisons (Algorithme de croisement des attributs).
- [x] Service `StockService`: Gestion des mouvements de stock (`increment`, `decrement`).
- [x] Endpoint Public: `GET /products` (avec filtres et pagination).
- [x] Endpoint Public: `GET /products/:id` (incluant les groupes d'attributs pour le selecteur).

### 💰 Pricing Engine (Moteur de Prix)

- [] Modèle Prisma `SpecificPrice` (Règles de réduction).
- [] Modèle Prisma `TaxRule` (TVA par pays).
- [] Service `PriceCalculationService` (Le cerveau du prix).
  - [] Logique: Prix Base + Impact Combinaison.
  - [] Logique: Application de la réduction `CustomerGroup`.
  - [] Logique: Recherche de `SpecificPrice` (Date, Quantité, Pays).
  - [] Logique: Calcul TTC (Taxe).

### 🛒 Cart & Orders

- [ ] Modèle Prisma `Cart` et `CartItem`.
- [ ] Modèle Prisma `Order`, `OrderState`, `OrderAddress`.
- [ ] Service `CartService`: `addToCart` (Vérification Stock + Validation Combinaison).
- [ ] Service `OrderService`: Transformation Panier -> Commande.
- [ ] Endpoint: `POST /cart/add`.
- [ ] Endpoint: `GET /cart` (Retourne le panier complet calculé).
- [ ] Endpoint: `POST /order/create` (Tunnel de commande).

---

# #Frontend (Next.js 15+ - App Router)

### 🏗️ Core & Architecture

- [x] Configurer l'application `storefront` (Next.js App Router).
- [x] Configurer Tailwind CSS & `cn` utility (clsx + tailwind-merge).
- [ ] Configurer les Server Actions (pour les mutations sans API routes intermédiaires si possible, ou fetch vers NestJS).
- [x] Créer les librairies N UI (`libs/storefront/ui-kit`) ou dossier `components/ui`.
- [x] Configurer `NextAuth.js` (v5) ou gestion manuelle des Cookies JWT (Middleware).
- [ ] Créer le Store Global (Zustand) pour l'état Client (Panier UI, Préférences).

### 👤 User Identity

- [ ] Page `(auth)/login/page.ts` (Server Action `loginAction`).
- [ ] Page `(auth)/register/page.ts` (React Hook Form + Zod).
- [ ] Layout `(dashboard)/layout.ts` (Protection via Middleware).
- [ ] Page `(dashboard)/account/page.ts` (Dashboard client - Server Component).
- [ ] Page `(dashboard)/addresses/page.ts` (CRUD Adresses via Server Actions).

### 🛍️ Product Catalog UI

- [ ] Composant `ProductList` (Server Component avec `fetch` et cache tags).
- [ ] Composant `ProductFilter` (URL Search Params pour filtrage SSR).
- [ ] Composant `ProductCard` (Client Component pour interactivité rapide).
- [ ] Page `products/[slug]/page.ts`.
  - [ ] `generateMetadata` pour le SEO dynamique.
  - [ ] Fetching des données produit (Parallèle avec Suspense).
  - [ ] Composant `ProductGallery` (Optimisation `next/image`).
  - [ ] Composant `ProductAttributes` (Selecteur Taille/Couleur - Update URL params).
  - [ ] Hook `usePrice` (Calcul réactif côté client si changement de variante).
  - [ ] Bouton "Ajouter au panier" (useTransition pour pending state).

### 🛒 Checkout Experience

- [ ] Composant `CartSheet` (Sheet Shadcn/UI pour le mini-panier).
- [ ] Page `cart/page.ts` (Résumé détaillé - Server Component).
- [ ] Page `checkout/page.ts` (Tunnel de commande).
  - [ ] Step 1: Informations (Server Action validation).
  - [ ] Step 2: Adresses (Selection visuelle).
  - [ ] Step 3: Livraison (Calcul frais de port temps réel).
  - [ ] Step 4: Paiement (Intégration Stripe/Paypal Elements).

### 🎨 UI Kit (Design System - React/Tailwind/shadcn/ui use dark mode theme)

- [ ] Composant `Button` (Variants: default, destructive, outline, ghost).
- [ ] Composant `Input` (Wrapper avec Label et Error message).
- [ ] Composant `Badge` (Pour les stocks/promos).
- [ ] Composant `Toast` (Sonner ou React-Hot-Toast).
- [ ] Composant `Skeleton` (Pour les loading states Suspense).
