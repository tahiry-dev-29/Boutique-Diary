"use server";

import { prisma } from "@/lib/prisma";
import {
  updateTheme,
  activateTheme,
  deleteTheme,
  hardDeleteTheme,
  restoreTheme,
} from "@/lib/theme/theme-service";
import { StoreTheme } from "@/lib/theme/theme-config";

export async function saveTheme(data: Partial<StoreTheme>) {
  try {
    const updatedTheme = await updateTheme(data);
    return { success: true, theme: updatedTheme };
  } catch (error) {
    console.error("Failed to save theme:", error);
    return { success: false, error: "Failed to save theme" };
  }
}

export async function activateThemeAction(id: number) {
  try {
    await activateTheme(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to activate theme:", error);
    return { success: false, error: "Failed to activate theme" };
  }
}

export async function deleteThemeAction(id: number) {
  try {
    const allThemes = await prisma.storeTheme.findMany({
      where: { id },
    });
    const theme = allThemes[0];
    if (theme && theme.name === "Boutique Originale") {
      return {
        success: false,
        error: "Le thème 'Boutique Originale' ne peut pas être supprimé.",
      };
    }

    await deleteTheme(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete theme:", error);
    return { success: false, error: "Failed to delete theme" };
  }
}

export async function restoreThemeAction(id: number) {
  try {
    await restoreTheme(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to restore theme:", error);
    return { success: false, error: "Failed to restore theme" };
  }
}
export async function hardDeleteThemeAction(id: number) {
  try {
    const allThemes = await prisma.storeTheme.findMany({
      where: { id },
    });
    const theme = allThemes[0];
    if (theme && theme.name === "Boutique Originale") {
      return {
        success: false,
        error: "Le thème 'Boutique Originale' ne peut pas être supprimé.",
      };
    }

    await hardDeleteTheme(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete theme:", error);
    return { success: false, error: "Failed to permanently delete theme" };
  }
}
