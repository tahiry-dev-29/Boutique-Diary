import { prisma } from "@/lib/prisma";
import { StoreTheme, defaultTheme, themeSchema } from "./theme-config";
import { revalidatePath } from "next/cache";

export async function getTheme(): Promise<StoreTheme> {
  try {
    let theme = await prisma.storeTheme.findFirst({
      where: { isActive: true, deletedAt: null },
    });

    if (!theme) {
      // Check if "Boutique Originale" exists anywhere (even in trash or deactivated)
      const original = await prisma.storeTheme.findFirst({
        where: { name: "Boutique Originale" },
      });

      if (!original) {
        // Create the core default theme
        theme = await prisma.storeTheme.create({
          data: {
            ...defaultTheme,
            isActive: true,
          },
        });
      } else {
        // Activate it if it was inactive
        theme = await prisma.storeTheme.update({
          where: { id: original.id },
          data: { isActive: true, deletedAt: null },
        });
      }
    }
    return theme as StoreTheme;
  } catch (error) {
    console.warn("Failed to fetch theme, using default:", error);
    return defaultTheme;
  }
}

export async function getAllThemes() {
  return prisma.storeTheme.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTrashedThemes() {
  return prisma.storeTheme.findMany({
    where: { NOT: { deletedAt: null } },
    orderBy: { deletedAt: "desc" },
  });
}

export async function activateTheme(id: number) {
  await prisma.storeTheme.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  const updated = await prisma.storeTheme.update({
    where: { id },
    data: { isActive: true },
  });

  revalidatePath("/");
  revalidatePath("/admin/appearance/theme");
  return updated;
}

export async function deleteTheme(id: number) {
  const updated = await prisma.storeTheme.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  revalidatePath("/");
  revalidatePath("/admin/appearance/theme");
  return updated;
}

export async function hardDeleteTheme(id: number) {
  const result = await prisma.storeTheme.delete({
    where: { id },
  });
  revalidatePath("/admin/appearance/theme");
  return result;
}

export async function restoreTheme(id: number) {
  const updated = await prisma.storeTheme.update({
    where: { id },
    data: { deletedAt: null },
  });
  revalidatePath("/admin/appearance/theme");
  return updated;
}

export async function updateTheme(
  data: Partial<StoreTheme>,
): Promise<StoreTheme> {
  const result = themeSchema.partial().safeParse(data);
  if (!result.success) {
    throw new Error("Invalid theme data");
  }

  let theme;
  if (data.id) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updateData } = result.data;
    theme = await prisma.storeTheme.update({
      where: { id: data.id },
      data: updateData,
    });
  } else {
    // If it's a new theme and set to active, deactivate others
    if (data.isActive !== false) {
      await prisma.storeTheme.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    theme = await prisma.storeTheme.create({
      data: {
        ...defaultTheme,
        ...result.data,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/appearance/theme");

  return theme as StoreTheme;
}
