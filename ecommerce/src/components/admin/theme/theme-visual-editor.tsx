"use client";

import { useState } from "react";
import {
  StoreTheme,
  HeaderConfig,
  HeroConfig,
  SectionsConfig,
} from "@/lib/theme/theme-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { HeaderEditor } from "./header-editor";
import { HeroEditor } from "./hero-editor";
import { SectionListEditor } from "./section-list-editor";
import { LivePreviewPanel } from "./preview/live-preview-panel";
import {
  LayoutTemplate,
  Menu,
  Footprints,
  Sparkles,
  Layers,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeVisualEditorProps {
  currentValues: StoreTheme;
  onHeaderChange: (config: HeaderConfig) => void;
  onHeroChange: (config: HeroConfig) => void;
  onSectionsChange: (config: SectionsConfig) => void;
}

export function ThemeVisualEditor({
  currentValues,
  onHeaderChange,
  onHeroChange,
  onSectionsChange,
}: ThemeVisualEditorProps) {
  const [activeTab, setActiveTab] = useState<"header" | "hero" | "sections">(
    "header",
  );
  const [showPreview, setShowPreview] = useState(true);

  const tabItems = [
    { id: "header", label: "Header", icon: Menu },
    { id: "hero", label: "Hero", icon: Sparkles },
    { id: "sections", label: "Sections", icon: Layers },
  ] as const;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <Card className="rounded-[32px] border-2 border-gray-100 shadow-none overflow-hidden">
        <CardHeader className="bg-linear-to-r from-primary/5 to-accent/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <LayoutTemplate className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-black">
                  Éditeur Visuel
                </CardTitle>
                <CardDescription>Personnalisez chaque section</CardDescription>
              </div>
            </div>

            {/* Preview Toggle (for mobile) */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={cn(
                "xl:hidden p-2 rounded-xl transition-all",
                showPreview
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200",
              )}
              title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
            >
              {showPreview ? (
                <PanelRightClose className="w-5 h-5" />
              ) : (
                <PanelRightOpen className="w-5 h-5" />
              )}
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={v => setActiveTab(v as typeof activeTab)}
          >
            {/* Tab List */}
            <div className="border-b border-gray-100 px-4 overflow-x-auto">
              <TabsList className="bg-transparent h-12 w-full justify-start gap-0 p-0">
                {tabItems.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        "relative h-12 px-4 rounded-none border-b-2 border-transparent transition-all",
                        "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                        "data-[state=active]:border-b-primary",
                      )}
                    >
                      <tab.icon
                        className={cn(
                          "w-4 h-4 mr-2",
                          isActive ? "text-primary" : "text-gray-400",
                        )}
                      />
                      <span
                        className={cn(
                          "font-bold text-sm",
                          isActive ? "text-primary" : "text-gray-500",
                        )}
                      >
                        {tab.label}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <TabsContent
                value="header"
                className="mt-0 focus-visible:outline-none"
              >
                <HeaderEditor
                  value={currentValues.headerConfig as HeaderConfig | null}
                  onChange={onHeaderChange}
                />
              </TabsContent>

              <TabsContent
                value="hero"
                className="mt-0 focus-visible:outline-none"
              >
                <HeroEditor
                  value={currentValues.heroConfig as HeroConfig | null}
                  onChange={onHeroChange}
                />
              </TabsContent>

              <TabsContent
                value="sections"
                className="mt-0 focus-visible:outline-none"
              >
                <SectionListEditor
                  value={currentValues.sectionsConfig as SectionsConfig | null}
                  onChange={onSectionsChange}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Live Preview Panel */}
      <Card
        className={cn(
          "rounded-[32px] border-2 border-gray-100 shadow-none overflow-hidden h-[700px]",
          showPreview ? "block" : "hidden xl:block",
        )}
      >
        <LivePreviewPanel
          currentValues={currentValues}
          activeSection={activeTab}
        />
      </Card>
    </div>
  );
}
