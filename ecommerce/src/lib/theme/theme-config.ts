import { z } from "zod";

// =============================================================================
// SECTION CONFIGURATION SCHEMAS
// =============================================================================

// Header Configuration
export const headerConfigSchema = z.object({
  style: z.enum(["classic", "minimal", "centered"]).default("classic"),
  bgColor: z.string().optional(),
  transparent: z.boolean().default(false),
  sticky: z.boolean().default(true),
  logoPosition: z.enum(["left", "center"]).default("left"),
});

// Hero Section Configuration
export const heroConfigSchema = z.object({
  style: z.enum(["large", "split", "video", "minimal"]).default("large"),
  title: z.string().default("Découvrez l'élégance de Diary Boutique"),
  subtitle: z.string().optional(),
  ctaText: z.string().default("Contactez-nous"),
  ctaLink: z.string().default("/contact"),
  bgImage: z.string().optional(),
  overlay: z.boolean().default(false),
  overlayOpacity: z.number().min(0).max(1).default(0.5),
});

// Individual Section Config
export const sectionConfigSchema = z.object({
  id: z.string(),
  type: z.enum([
    "promo",
    "collection",
    "features",
    "services",
    "banner",
    "products",
    "testimonials",
  ]),
  enabled: z.boolean().default(true),
  order: z.number(),
  title: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
});

// All home sections
export const sectionsConfigSchema = z.array(sectionConfigSchema);

// =============================================================================
// MAIN THEME SCHEMA
// =============================================================================

export const themeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).default("Mon Thème"),

  // Colors
  primaryColor: z
    .string()
    .min(4)
    .max(9)
    .regex(/^#/, "Must be a valid hex code"),
  primaryOpacity: z.number().min(0).max(1).default(1),
  primaryGradient: z.string().optional().nullable(),
  secondaryColor: z
    .string()
    .min(4)
    .max(9)
    .regex(/^#/, "Must be a valid hex code"),
  secondaryOpacity: z.number().min(0).max(1).default(1),
  secondaryGradient: z.string().optional().nullable(),
  accentColor: z.string().min(4).max(9).regex(/^#/, "Must be a valid hex code"),

  // Typography
  fontHeading: z.string().min(1),
  fontBody: z.string().min(1),

  // Background
  backgroundColor: z
    .string()
    .min(4)
    .max(9)
    .regex(/^#/, "Must be a valid hex code")
    .default("#ffffff"),
  textColor: z
    .string()
    .min(4)
    .max(9)
    .regex(/^#/, "Must be a valid hex code")
    .default("#1a1a1a"),

  // Section Configs (JSON fields)
  headerConfig: headerConfigSchema.optional().nullable(),
  heroConfig: heroConfigSchema.optional().nullable(),
  sectionsConfig: sectionsConfigSchema.optional().nullable(),

  isActive: z.boolean().default(true).optional(),
});

// =============================================================================
// TYPES
// =============================================================================

export type HeaderConfig = z.infer<typeof headerConfigSchema>;
export type HeroConfig = z.infer<typeof heroConfigSchema>;
export type SectionConfig = z.infer<typeof sectionConfigSchema>;
export type SectionsConfig = z.infer<typeof sectionsConfigSchema>;
export type StoreTheme = z.infer<typeof themeSchema>;

// =============================================================================
// DEFAULTS
// =============================================================================

export const defaultHeaderConfig: HeaderConfig = {
  style: "classic",
  transparent: false,
  sticky: true,
  logoPosition: "left",
};

export const defaultHeroConfig: HeroConfig = {
  style: "large",
  title: "Découvrez l'élégance de Diary Boutique",
  ctaText: "Contactez-nous",
  ctaLink: "/contact",
  overlay: false,
  overlayOpacity: 0.5,
};

export const defaultSectionsConfig: SectionsConfig = [
  { id: "promo", type: "promo", enabled: true, order: 1 },
  { id: "collection", type: "collection", enabled: true, order: 2 },
  { id: "features", type: "features", enabled: true, order: 3 },
  { id: "services", type: "services", enabled: true, order: 4 },
  { id: "banner", type: "banner", enabled: true, order: 5 },
  { id: "products", type: "products", enabled: true, order: 6 },
  { id: "testimonials", type: "testimonials", enabled: true, order: 7 },
];

export const defaultTheme: StoreTheme = {
  name: "Diary Boutique Original",
  primaryColor: "#3d6b6b",
  primaryOpacity: 1,
  primaryGradient: null,
  secondaryColor: "#d4b8a5",
  secondaryOpacity: 1,
  secondaryGradient: null,
  accentColor: "#c45a4a",
  fontHeading: "Playfair Display",
  fontBody: "Montserrat",
  isActive: true,
  backgroundColor: "#ffffff",
  textColor: "#1a1a1a",
  headerConfig: defaultHeaderConfig,
  heroConfig: defaultHeroConfig,
  sectionsConfig: defaultSectionsConfig,
};

// =============================================================================
// PRESETS
// =============================================================================

export const THEME_PRESETS: Record<string, Partial<StoreTheme>> = {
  "Boutique Originale": {
    primaryColor: "#3d6b6b",
    secondaryColor: "#d4b8a5",
    accentColor: "#c45a4a",
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
  },
  Nature: {
    primaryColor: "#2D5A27",
    secondaryColor: "#F4F1DE",
    accentColor: "#A7C957",
    backgroundColor: "#F8F9FA",
    textColor: "#1B4332",
  },
  Luxury: {
    primaryColor: "#1A1A1A",
    secondaryColor: "#D4AF37",
    accentColor: "#F5F5F5",
    backgroundColor: "#FFFFFF",
    textColor: "#111111",
  },
  Vibrant: {
    primaryColor: "#6D28D9",
    secondaryColor: "#FDE047",
    accentColor: "#F43F5E",
    backgroundColor: "#FDFCFE",
    textColor: "#1E1B4B",
  },
  "Minimal Noir": {
    primaryColor: "#000000",
    secondaryColor: "#737373",
    accentColor: "#D4D4D4",
    backgroundColor: "#FFFFFF",
    textColor: "#171717",
  },
};

// Section type labels for UI
export const SECTION_TYPE_LABELS: Record<SectionConfig["type"], string> = {
  promo: "Promotions",
  collection: "Collections",
  features: "Points Forts",
  services: "Services",
  banner: "Bannière",
  products: "Grille Produits",
  testimonials: "Témoignages",
};
