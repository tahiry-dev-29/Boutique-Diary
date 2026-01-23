"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  Palette,
  Type,
  Layout,
  RefreshCw,
  Wand2,
  Power,
} from "lucide-react";

import {
  themeSchema,
  StoreTheme,
  THEME_PRESETS,
  HeaderConfig,
  HeroConfig,
  SectionsConfig,
} from "@/lib/theme/theme-config";
import { ThemeColorPicker } from "./theme-color-picker";
import { ThemeFontSelector } from "./theme-font-selector";
import { ThemeVisualEditor } from "./theme/theme-visual-editor";
import { saveTheme } from "@/app/admin/appearance/theme/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper functions for color conversion
const toHexAlpha = (hex: string, opacity: number) => {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alpha}`;
};

const fromHexAlpha = (hexAlpha: string) => {
  const hex = hexAlpha.slice(0, 7);
  const alphaHex = hexAlpha.slice(7, 9);
  const opacity = alphaHex ? parseInt(alphaHex, 16) / 255 : 1;
  return { hex, opacity: parseFloat(opacity.toFixed(2)) };
};

interface ThemeFormProps {
  initialData: StoreTheme;
}

export function ThemeForm({ initialData }: ThemeFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<"design" | "layout">(
    "design",
  );
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<StoreTheme>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(themeSchema) as any,
    defaultValues: initialData,
  });

  // Watch values for real-time preview
  const currentValues = watch();

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSave = async (data: StoreTheme, asNew: boolean = false) => {
    setIsSaving(true);
    try {
      const submitData = asNew
        ? { ...data, id: undefined, isActive: false }
        : data;

      const result = await saveTheme(submitData);
      if (result.success) {
        toast.success(
          asNew ? "Nouveau thème créé" : "Thème enregistré avec succès",
        );
        if (result.theme) {
          reset(result.theme as StoreTheme);
          if (asNew) {
            router.push(
              `/admin/appearance/theme?view=customize&id=${result.theme.id}`,
            );
          }
          router.refresh();
        }
      } else {
        toast.error(result.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = (data: StoreTheme) => onSave(data, false);

  const applyPreset = (presetName: string) => {
    const preset = THEME_PRESETS[presetName as keyof typeof THEME_PRESETS];
    if (preset) {
      Object.entries(preset).forEach(([key, value]) => {
        setValue(key as keyof StoreTheme, value, { shouldDirty: true });
      });
      toast.info(`Preset "${presetName}" appliqué`);

      // Update theme name - always adapt as requested
      setValue("name", presetName, { shouldDirty: true });
    }
  };

  // Section config handlers
  const handleHeaderChange = (config: HeaderConfig) => {
    setValue("headerConfig", config, { shouldDirty: true });
  };

  const handleHeroChange = (config: HeroConfig) => {
    setValue("heroConfig", config, { shouldDirty: true });
  };

  const handleSectionsChange = (config: SectionsConfig) => {
    setValue("sectionsConfig", config, { shouldDirty: true });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 animate-in fade-in duration-500"
    >
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex-1">
          <Label htmlFor="theme-name" className="sr-only">
            Nom du thème
          </Label>
          <Input
            id="theme-name"
            {...register("name")}
            className="text-lg font-bold border-0 bg-transparent shadow-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 h-auto"
            placeholder="Nom du thème..."
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Activate Toggle */}
          <div className="flex items-center gap-2 mr-2 bg-muted/50 p-2 rounded-lg border border-border/50">
            <Switch
              id="theme-active"
              checked={!!currentValues.isActive}
              onCheckedChange={checked =>
                setValue("isActive", checked, { shouldDirty: true })
              }
            />
            <Label
              htmlFor="theme-active"
              className="text-xs font-medium cursor-pointer flex items-center gap-1.5"
            >
              <Power
                className={
                  currentValues.isActive
                    ? "w-3 h-3 text-emerald-500"
                    : "w-3 h-3 text-muted-foreground"
                }
              />
              {currentValues.isActive ? "Actif" : "Inactif"}
            </Label>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => reset(initialData)}
            disabled={!isDirty || isSaving}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Réinitialiser
          </Button>

          {initialData.id && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={e => {
                e.preventDefault();
                handleSubmit(data => onSave(data, true))();
              }}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" /> Copier
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSaving || !isDirty}
            size="sm"
            className="px-6"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Main Tabs: Design vs Layout */}
      <Tabs
        value={activeMainTab}
        onValueChange={v => setActiveMainTab(v as "design" | "layout")}
      >
        <TabsList className="bg-muted w-full justify-start h-auto p-1 rounded-lg">
          <TabsTrigger value="design" className="flex-1 max-w-[200px] gap-2">
            <Palette className="h-4 w-4" /> Design
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex-1 max-w-[200px] gap-2">
            <Layout className="h-4 w-4" /> Mise en Page
          </TabsTrigger>
        </TabsList>

        {/* Design Tab Content */}
        <TabsContent value="design" className="mt-8 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Color Palette Card */}
                <Card className="border-border shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" /> Palette de
                      Couleurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <ThemeColorPicker
                        label="Principale"
                        value={toHexAlpha(
                          currentValues.primaryColor,
                          currentValues.primaryOpacity || 1,
                        )}
                        onChange={val => {
                          const { hex, opacity } = fromHexAlpha(val);
                          setValue("primaryColor", hex, { shouldDirty: true });
                          setValue("primaryOpacity", opacity, {
                            shouldDirty: true,
                          });
                        }}
                      />
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase text-muted-foreground">
                            Dégradé
                          </Label>
                          <Input
                            placeholder="linear-gradient..."
                            className="h-7 text-xs"
                            {...register("primaryGradient")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-dashed">
                      <ThemeColorPicker
                        label="Secondaire"
                        value={toHexAlpha(
                          currentValues.secondaryColor,
                          currentValues.secondaryOpacity || 1,
                        )}
                        onChange={val => {
                          const { hex, opacity } = fromHexAlpha(val);
                          setValue("secondaryColor", hex, {
                            shouldDirty: true,
                          });
                          setValue("secondaryOpacity", opacity, {
                            shouldDirty: true,
                          });
                        }}
                      />
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase text-muted-foreground">
                            Dégradé
                          </Label>
                          <Input
                            placeholder="linear-gradient..."
                            className="h-7 text-xs"
                            {...register("secondaryGradient")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-dashed">
                      <ThemeColorPicker
                        label="Accent"
                        value={currentValues.accentColor}
                        onChange={val =>
                          setValue("accentColor", val, { shouldDirty: true })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Typography Card */}
                <Card className="border-border shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Type className="h-4 w-4 text-primary" /> Typographie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <ThemeFontSelector
                      label="Police des Titres"
                      value={currentValues.fontHeading}
                      onChange={val =>
                        setValue("fontHeading", val, { shouldDirty: true })
                      }
                    />
                    <ThemeFontSelector
                      label="Police du Corps"
                      value={currentValues.fontBody}
                      onChange={val =>
                        setValue("fontBody", val, { shouldDirty: true })
                      }
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Background Card */}
              <Card className="border-border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Layout className="h-4 w-4 text-primary" /> Fond de la
                    Boutique
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ThemeColorPicker
                      label="Couleur de Fond"
                      value={currentValues.backgroundColor || "#ffffff"}
                      onChange={val =>
                        setValue("backgroundColor", val, { shouldDirty: true })
                      }
                    />
                    <ThemeColorPicker
                      label="Couleur du Texte"
                      value={currentValues.textColor || "#111111"}
                      onChange={val =>
                        setValue("textColor", val, { shouldDirty: true })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Presets Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="border-border shadow-sm overflow-hidden sticky top-24">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-primary" /> Thèmes Prédéfinis
                  </CardTitle>
                  <CardDescription>Styles rapides</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {Object.keys(THEME_PRESETS).map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-all text-left group"
                    >
                      <span className="font-medium text-sm">{preset}</span>
                      <div className="flex gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-border/50"
                          style={{
                            backgroundColor:
                              THEME_PRESETS[
                                preset as keyof typeof THEME_PRESETS
                              ].primaryColor,
                          }}
                        />
                        <div
                          className="w-3 h-3 rounded-full border border-border/50"
                          style={{
                            backgroundColor:
                              THEME_PRESETS[
                                preset as keyof typeof THEME_PRESETS
                              ].secondaryColor,
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Layout Tab Content - Visual Editor */}
        <TabsContent value="layout" className="mt-8 outline-none">
          <ThemeVisualEditor
            currentValues={currentValues}
            onHeaderChange={handleHeaderChange}
            onHeroChange={handleHeroChange}
            onSectionsChange={handleSectionsChange}
          />
        </TabsContent>
      </Tabs>
    </form>
  );
}
