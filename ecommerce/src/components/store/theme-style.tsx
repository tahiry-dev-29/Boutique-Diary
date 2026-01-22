"use client";

import { usePathname } from "next/navigation";
import { StoreTheme, StylePreset } from "@/lib/theme/theme-config";

// Style-specific configurations for each paradigm
const styleConfigs: Record<
  StylePreset,
  {
    cardRadius: string;
    cardShadow: string;
    cardBlur: string;
    cardBorder: string;
    cardBg: string;
    btnRadius: string;
    btnShadow: string;
    btnBorder: string;
    btnTransform: string;
    inputRadius: string;
    inputShadow: string;
    inputBorder: string;
    badgeRadius: string;
  }
> = {
  material: {
    cardRadius: "16px",
    cardShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    cardBlur: "0",
    cardBorder: "1px solid rgba(0, 0, 0, 0.05)",
    cardBg: "var(--background)",
    btnRadius: "8px",
    btnShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    btnBorder: "none",
    btnTransform: "translateY(-1px)",
    inputRadius: "8px",
    inputShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    inputBorder: "1px solid rgba(0, 0, 0, 0.1)",
    badgeRadius: "8px",
  },
  glassmorphism: {
    cardRadius: "24px",
    cardShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    cardBlur: "16px",
    cardBorder: "1px solid rgba(255, 255, 255, 0.18)",
    cardBg: "rgba(255, 255, 255, 0.1)",
    btnRadius: "12px",
    btnShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
    btnBorder: "1px solid rgba(255, 255, 255, 0.2)",
    btnTransform: "scale(1.02)",
    inputRadius: "12px",
    inputShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
    inputBorder: "1px solid rgba(255, 255, 255, 0.2)",
    badgeRadius: "20px",
  },
  neobrutalism: {
    cardRadius: "0",
    cardShadow: "4px 4px 0 0 var(--store-primary)",
    cardBlur: "0",
    cardBorder: "3px solid var(--text-main)",
    cardBg: "var(--background)",
    btnRadius: "0",
    btnShadow: "4px 4px 0 0 var(--text-main)",
    btnBorder: "3px solid var(--text-main)",
    btnTransform: "translate(-2px, -2px)",
    inputRadius: "0",
    inputShadow: "none",
    inputBorder: "3px solid var(--text-main)",
    badgeRadius: "0",
  },
  minimal: {
    cardRadius: "4px",
    cardShadow: "none",
    cardBlur: "0",
    cardBorder: "1px solid rgba(0, 0, 0, 0.08)",
    cardBg: "var(--background)",
    btnRadius: "2px",
    btnShadow: "none",
    btnBorder: "1px solid currentColor",
    btnTransform: "none",
    inputRadius: "2px",
    inputShadow: "none",
    inputBorder: "1px solid rgba(0, 0, 0, 0.15)",
    badgeRadius: "2px",
  },
};

export function ThemeStyle({ theme }: { theme: StoreTheme }) {
  const pathname = usePathname();
  const isAdminPage =
    pathname?.startsWith("/admin") || pathname?.startsWith("/admin-login");

  if (isAdminPage) return null;

  const preset = theme.stylePreset || "material";
  const style = styleConfigs[preset];

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        :root {
          /* Store Theme Custom Variables */
          --store-primary: ${theme.primaryColor};
          --store-primary-rgb: ${hexToRgb(theme.primaryColor)};
          --store-primary-opacity: ${theme.primaryOpacity || 1};
          --store-primary-gradient: ${theme.primaryGradient || "none"};

          --store-secondary: ${theme.secondaryColor};
          --store-secondary-rgb: ${hexToRgb(theme.secondaryColor)};
          --store-secondary-opacity: ${theme.secondaryOpacity || 1};
          --store-secondary-gradient: ${theme.secondaryGradient || "none"};

          --store-accent: ${theme.accentColor};
          --font-heading: "${theme.fontHeading}", serif;
          --font-body: "${theme.fontBody}", sans-serif;

          /* Override Standard Shadcn/Tailwind Variables */
          --primary: ${theme.primaryColor};
          --secondary: ${theme.secondaryColor};
          --accent: ${theme.accentColor};
          --background: ${theme.backgroundColor || "#ffffff"};
          --foreground: ${theme.textColor || "#1a1a1a"};
          --card: ${theme.backgroundColor || "#ffffff"};
          --card-foreground: ${theme.textColor || "#1a1a1a"};
          --popover: ${theme.backgroundColor || "#ffffff"};
          --popover-foreground: ${theme.textColor || "#1a1a1a"};
          
          /* Semantic Mappings */
          --header-bg: ${theme.backgroundColor || "#ffffff"}f2;
          --text-main: ${theme.textColor || "#1a1a1a"};
          
          /* Gradients */
          --primary-gradient: ${theme.primaryGradient || `linear-gradient(to right, ${theme.primaryColor}, ${theme.primaryColor})`};
          --secondary-gradient: ${theme.secondaryGradient || `linear-gradient(to right, ${theme.secondaryColor}, ${theme.secondaryColor})`};

          /* Override Fonts */
          --font-sans: "${theme.fontBody}", sans-serif;
          
          /* Derived Colors */
          --ring: ${theme.primaryColor};

          /* ===== STYLE PRESET VARIABLES ===== */
          --style-preset: "${preset}";
          
          /* Card Styles */
          --card-radius: ${style.cardRadius};
          --card-shadow: ${style.cardShadow};
          --card-blur: ${style.cardBlur};
          --card-border: ${style.cardBorder};
          --card-bg: ${style.cardBg};
          
          /* Button Styles */
          --btn-radius: ${style.btnRadius};
          --btn-shadow: ${style.btnShadow};
          --btn-border: ${style.btnBorder};
          --btn-transform: ${style.btnTransform};
          
          /* Input Styles */
          --input-radius: ${style.inputRadius};
          --input-shadow: ${style.inputShadow};
          --input-border: ${style.inputBorder};
          
          /* Badge Styles */
          --badge-radius: ${style.badgeRadius};
        }

        /* ===== FONT APPLICATION (only to text elements, not icons) ===== */
        body {
          font-family: var(--font-body);
          background-color: var(--background);
          color: var(--text-main);
        }

        h1, h2, h3, h4, h5, h6,
        .font-heading, .font-playfair {
          font-family: var(--font-heading);
        }

        p, span, div, section, article, li {
          font-family: var(--font-body);
        }

        /* ===== EXPLICIT CARD STYLING (specific classes only) ===== */
        .product-card-reveal {
          border-radius: var(--card-radius);
          box-shadow: var(--card-shadow);
          border: var(--card-border);
          background: var(--card-bg);
        }

        /* ===== BUTTON STYLING (data-slot only) ===== */
        button[data-slot="button"] {
          border-radius: var(--btn-radius);
          box-shadow: var(--btn-shadow);
        }

        button[data-slot="button"]:hover {
          transform: var(--btn-transform);
        }

        /* Primary buttons with gradient */
        .bg-primary, .btn-primary {
          background: var(--primary-gradient);
        }

        .bg-secondary, .btn-secondary {
          background: var(--secondary-gradient);
        }

        /* Text color classes */
        .text-primary { color: var(--store-primary); }
        .text-secondary { color: var(--store-secondary); }
        .text-accent { color: var(--store-accent); }


        /* ===== NEOBRUTALISM SPECIFIC ===== */
        ${
          preset === "neobrutalism"
            ? `
        /* Brutalist button press effect */
        button[data-slot="button"]:active {
          transform: translate(2px, 2px);
          box-shadow: 0 0 0 0 var(--text-main);
        }
        
        /* Brutalist borders on main product cards only */
        .product-card-reveal {
          border: 3px solid var(--text-main);
          box-shadow: 4px 4px 0 0 var(--store-primary);
        }
        `
            : ""
        }
      `,
      }}
    />
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "0, 0, 0";
}
