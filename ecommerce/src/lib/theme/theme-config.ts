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

// Style Preset Enum - Controls entire UI paradigm
export const stylePresetEnum = z.enum([
  "material",
  "glassmorphism",
  "neobrutalism",
  "minimal",
]);

export type StylePreset = z.infer<typeof stylePresetEnum>;

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

  // Style Preset - Controls UI paradigm (buttons, cards, shadows, etc.)
  stylePreset: stylePresetEnum.default("material"),

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
  stylePreset: "material",
  headerConfig: defaultHeaderConfig,
  heroConfig: defaultHeroConfig,
  sectionsConfig: defaultSectionsConfig,
};

// =============================================================================
// PRESETS
// =============================================================================

export const THEME_PRESETS: Record<string, Partial<StoreTheme>> = {
  // Material Design - Clean, elevated, professional
  "Material Luxe": {
    primaryColor: "#1976D2",
    secondaryColor: "#FFC107",
    accentColor: "#FF5722",
    backgroundColor: "#FAFAFA",
    textColor: "#212121",
    fontHeading: "Roboto",
    fontBody: "Roboto",
    stylePreset: "material",
  },
  // Neobrutalism - Bold, blocky, high contrast
  "Neo Bold": {
    primaryColor: "#FACC15",
    secondaryColor: "#F472B6",
    accentColor: "#22D3EE",
    backgroundColor: "#FEF3C7",
    textColor: "#1C1917",
    fontHeading: "Space Grotesk",
    fontBody: "Space Grotesk",
    stylePreset: "neobrutalism",
  },
  // Minimal - Clean, no shadows, sharp
  "Minimal Pure": {
    primaryColor: "#18181B",
    secondaryColor: "#A1A1AA",
    accentColor: "#3F3F46",
    backgroundColor: "#FFFFFF",
    textColor: "#09090B",
    fontHeading: "Inter",
    fontBody: "Inter",
    stylePreset: "minimal",
  },
  // Original Boutique (Material default)
  "Boutique Originale": {
    primaryColor: "#3d6b6b",
    secondaryColor: "#d4b8a5",
    accentColor: "#c45a4a",
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    fontHeading: "Playfair Display",
    fontBody: "Montserrat",
    stylePreset: "material",
  },
  // Treato Natural - Warm, organic, soft
  "Treato Natural": {
    primaryColor: "#EADDCD", // Sand/Beige from image background
    secondaryColor: "#D4C5B0", // Slightly darker beige
    accentColor: "#1A1A1A", // Dark text/buttons from image
    backgroundColor: "#EADDCD", // Main background
    textColor: "#1A1A1A", // Primary text color
    fontHeading: "Montserrat", // Looks like sans-serif geometric
    fontBody: "Inter",
    stylePreset: "minimal",
  },
  // Modern Tech - Deep Purple & Clean White
  "Modern Tech": {
    primaryColor: "#6C5CE7",
    secondaryColor: "#A29BFE",
    accentColor: "#00B894",
    backgroundColor: "#FFFFFF",
    textColor: "#2D3436",
    fontHeading: "Inter",
    fontBody: "Inter",
    stylePreset: "minimal",
  },
  // Sunset Vibes - Warm gradient feel
  "Sunset Vibes": {
    primaryColor: "#FF7675",
    secondaryColor: "#FAB1A0",
    accentColor: "#FD79A8",
    backgroundColor: "#FFF5F5",
    textColor: "#2D3436",
    fontHeading: "Poppins",
    fontBody: "Open Sans",
    stylePreset: "glassmorphism",
  },
  // Forest Minimal - Eucalyptus & Sage
  "Forest Minimal": {
    primaryColor: "#55E6C1",
    secondaryColor: "#58B19F",
    accentColor: "#F8EFBA",
    backgroundColor: "#F0FDF4",
    textColor: "#1B4332",
    fontHeading: "Montserrat",
    fontBody: "Lato",
    stylePreset: "neobrutalism",
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
