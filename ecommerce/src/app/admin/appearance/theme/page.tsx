import {
  getTheme,
  getAllThemes,
  getTrashedThemes,
} from "@/lib/theme/theme-service";
import { ThemeForm } from "@/components/admin/theme-form";
import { ThemeList } from "@/components/admin/theme-list";
import { ThemeTrash } from "@/components/admin/theme-trash";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, List, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StoreTheme } from "@/lib/theme/theme-config";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function ThemePage(props: {
  searchParams: Promise<{ view?: string; id?: string }>;
}) {
  const searchParams = await props.searchParams;
  const activeTheme = await getTheme();
  const allThemes = (await getAllThemes()) as unknown as (StoreTheme & {
    id: number;
    isActive: boolean;
  })[];
  const trashedThemes = (await getTrashedThemes()) as unknown as (StoreTheme & {
    id: number;
    deletedAt: Date | null;
  })[];

  const currentView = searchParams.view || "customize";
  const themeId = searchParams.id ? parseInt(searchParams.id) : null;

  // Use the ID from URL if editing, otherwise use active theme
  const themeToEdit = themeId
    ? allThemes.find((t) => t.id === themeId) || activeTheme
    : activeTheme;

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <PageHeader
        title="Thèmes & Apparence"
        description="Gérez l'identité visuelle de votre boutique en ligne."
      >
        {currentView !== "customize" && (
          <Button
            asChild
            className="rounded-full px-6 gap-2 shadow-lg shadow-primary/10 transition-transform hover:scale-105"
          >
            <Link href="/admin/appearance/theme?view=customize">
              <Plus className="h-4 w-4" /> Nouveau Thème
            </Link>
          </Button>
        )}
      </PageHeader>

      <Tabs value={currentView} className="space-y-8">
        <div className="flex items-center justify-center md:justify-start">
          <TabsList className="bg-gray-100/50 p-1.5 rounded-full h-auto border-2 border-gray-100 shadow-sm">
            <TabsTrigger
              value="customize"
              asChild
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all"
            >
              <Link
                href="/admin/appearance/theme?view=customize"
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" /> Personnaliser
              </Link>
            </TabsTrigger>
            <TabsTrigger
              value="list"
              asChild
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all"
            >
              <Link
                href="/admin/appearance/theme?view=list"
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" /> Liste des thèmes
              </Link>
            </TabsTrigger>
            <TabsTrigger
              value="trash"
              asChild
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all"
            >
              <Link
                href="/admin/appearance/theme?view=trash"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> Corbeille
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="customize" className="mt-0 outline-none">
          <ThemeForm initialData={themeToEdit} />
        </TabsContent>

        <TabsContent value="list" className="mt-0 outline-none">
          <ThemeList themes={allThemes} />
        </TabsContent>

        <TabsContent value="trash" className="mt-0 outline-none">
          <ThemeTrash trashedThemes={trashedThemes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
