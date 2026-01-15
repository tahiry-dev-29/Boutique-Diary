"use client";

import { usePathname } from "next/navigation";
import { StoreTheme } from "@/lib/theme/theme-config";

export function ThemeStyle({ theme }: { theme: StoreTheme }) {
  const pathname = usePathname();
  const isAdminPage =
    pathname?.startsWith("/admin") || pathname?.startsWith("/admin-login");

  if (isAdminPage) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        :root {
          /* Store Theme Custom Variables */
          --store-primary: ${theme.primaryColor} !important;
          --store-primary-rgb: ${hexToRgb(theme.primaryColor)};
          --store-primary-opacity: ${theme.primaryOpacity || 1} !important;
          --store-primary-gradient: ${theme.primaryGradient || "none"} !important;

          --store-secondary: ${theme.secondaryColor} !important;
          --store-secondary-rgb: ${hexToRgb(theme.secondaryColor)};
          --store-secondary-opacity: ${theme.secondaryOpacity || 1} !important;
          --store-secondary-gradient: ${theme.secondaryGradient || "none"} !important;

          --store-accent: ${theme.accentColor} !important;
          --font-heading: "${theme.fontHeading}", serif !important;
          --font-body: "${theme.fontBody}", sans-serif !important;

          /* Override Standard Shadcn/Tailwind Variables */
          --primary: ${theme.primaryColor} !important;
          --secondary: ${theme.secondaryColor} !important;
          --accent: ${theme.accentColor} !important;
          --background: ${theme.backgroundColor || "#ffffff"} !important;
          --card: ${theme.backgroundColor || "#ffffff"} !important;
          --popover: ${theme.backgroundColor || "#ffffff"} !important;
          
          /* Semantic Mappings */
          --header-bg: ${theme.backgroundColor || "#ffffff"}f2; /* Highly opaque background */
          --text-main: ${theme.textColor || "#1a1a1a"} !important;
          
          /* Gradients */
          --primary-gradient: ${theme.primaryGradient || `linear-gradient(to right, ${theme.primaryColor}, ${theme.primaryColor})`} !important;
          --secondary-gradient: ${theme.secondaryGradient || `linear-gradient(to right, ${theme.secondaryColor}, ${theme.secondaryColor})`} !important;

          /* Override Fonts */
          --font-sans: "${theme.fontBody}", sans-serif !important;
          
          /* Derived Colors */
          --ring: ${theme.primaryColor} !important;
        }

        /* Global Font & Color Application */
        body, 
        p:not(footer *), 
        span:not(footer *), 
        div:not(footer *), 
        section:not(footer *), 
        nav:not(footer *) {
          font-family: var(--font-body) !important;
          color: var(--text-main);
        }

        h1:not(footer *), 
        h2:not(footer *), 
        h3:not(footer *), 
        h4:not(footer *), 
        h5:not(footer *), 
        h6:not(footer *), 
        .font-heading:not(footer *), 
        .font-playfair:not(footer *) {
          font-family: var(--font-heading) !important;
        }
        
        body {
          background-color: var(--background) !important;
          color: var(--text-main) !important;
        }

        /* Gradient & Opacity Applications */
        .bg-primary, .btn-primary {
          background: var(--primary-gradient) !important;
          opacity: var(--store-primary-opacity) !important;
        }

        .bg-secondary, .btn-secondary {
          background: var(--secondary-gradient) !important;
          opacity: var(--store-secondary-opacity) !important;
        }

        .text-primary { color: var(--store-primary) !important; }
        .text-secondary { color: var(--store-secondary) !important; }
        .text-accent { color: var(--store-accent) !important; }
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
