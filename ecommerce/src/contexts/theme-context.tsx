"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export const THEME_PRESETS = {
  default: {
    name: "Default",
    primary: "oklch(0.205 0 0)",
    accent: "oklch(0.97 0 0)",
    indicator: "#1f2937",
  },
  underground: {
    name: "Underground",
    primary: "oklch(0.25 0.02 260)",
    accent: "oklch(0.95 0.01 260)",
    indicator: "#4c1d95",
  },
  "rose-garden": {
    name: "Rose Garden",
    primary: "oklch(0.55 0.2 350)",
    accent: "oklch(0.95 0.05 350)",
    indicator: "#e11d48",
  },
  "lake-view": {
    name: "Lake View",
    primary: "oklch(0.45 0.15 220)",
    accent: "oklch(0.95 0.03 220)",
    indicator: "#0891b2",
  },
  "sunset-glow": {
    name: "Sunset Glow",
    primary: "oklch(0.6 0.2 30)",
    accent: "oklch(0.95 0.05 30)",
    indicator: "#ea580c",
  },
  "forest-whisper": {
    name: "Forest Whisper",
    primary: "oklch(0.45 0.12 145)",
    accent: "oklch(0.95 0.03 145)",
    indicator: "#059669",
  },
  "ocean-breeze": {
    name: "Ocean Breeze",
    primary: "oklch(0.5 0.15 200)",
    accent: "oklch(0.95 0.03 200)",
    indicator: "#0284c7",
  },
  "lavender-dream": {
    name: "Lavender Dream",
    primary: "oklch(0.55 0.15 290)",
    accent: "oklch(0.95 0.04 290)",
    indicator: "#7c3aed",
  },
} as const;

export type ThemePreset = keyof typeof THEME_PRESETS;
export type ColorMode = "light" | "dark";
export type Scale = "default" | "xs" | "lg";
export type Radius = "default" | "sm" | "md" | "lg" | "xl";
export type ContentLayout = "full" | "centered";
export type SidebarMode = "default" | "icon";

interface ThemeState {
  preset: ThemePreset;
  colorMode: ColorMode;
  scale: Scale;
  radius: Radius;
  contentLayout: ContentLayout;
  sidebarMode: SidebarMode;
}

interface ThemeContextType extends ThemeState {
  setPreset: (preset: ThemePreset) => void;
  setColorMode: (mode: ColorMode) => void;
  setScale: (scale: Scale) => void;
  setRadius: (radius: Radius) => void;
  setContentLayout: (layout: ContentLayout) => void;
  setSidebarMode: (mode: SidebarMode) => void;
  resetTheme: () => void;
}

const DEFAULT_THEME: ThemeState = {
  preset: "default",
  colorMode: "light",
  scale: "default",
  radius: "default",
  contentLayout: "full",
  sidebarMode: "default",
};

const STORAGE_KEY = "boutique-admin-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTheme({ ...DEFAULT_THEME, ...parsed });
      } catch (e) {
        console.error("Failed to parse stored theme:", e);
      }
    }
    setMounted(true);
  }, []);

  // Persist theme to localStorage purely
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  }, [theme, mounted]);

  const contextValue: ThemeContextType = {
    ...theme,
    setPreset: preset => setTheme(t => ({ ...t, preset })),
    setColorMode: colorMode => setTheme(t => ({ ...t, colorMode })),
    setScale: scale => setTheme(t => ({ ...t, scale })),
    setRadius: radius => setTheme(t => ({ ...t, radius })),
    setContentLayout: contentLayout => setTheme(t => ({ ...t, contentLayout })),
    setSidebarMode: sidebarMode => setTheme(t => ({ ...t, sidebarMode })),
    resetTheme: () => setTheme(DEFAULT_THEME),
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
