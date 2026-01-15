"use client";

import {
  StoreTheme,
  HeaderConfig,
  HeroConfig,
  SectionsConfig,
} from "@/lib/theme/theme-config";
import { SectionsPreview } from "./sections-preview";
import StoreNavbar from "@/components/store/StoreNavbar";
import DiaryHero from "@/components/store/DiaryHero";
import StoreFooter from "@/components/store/StoreFooter";
import { Monitor, Smartphone, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LivePreviewPanelProps {
  currentValues: StoreTheme;
  activeSection?: "header" | "hero" | "sections";
}

export function LivePreviewPanel({
  currentValues,
  activeSection = "header",
}: LivePreviewPanelProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="h-full flex flex-col">
      {/* Preview Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Aperçu Live
          </span>
          <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-medium">
            ● En direct
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Device Toggle */}
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                device === "desktop"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                device === "mobile"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 bg-muted/30 p-4 overflow-auto">
        <div
          key={refreshKey}
          className={cn(
            "mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
            device === "desktop" ? "max-w-full" : "max-w-[320px]",
          )}
          style={{
            backgroundColor: currentValues.backgroundColor || "#ffffff",
          }}
        >
          {/* Browser Chrome */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-muted border-b border-border">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <div className="flex-1 mx-4">
              <div className="h-5 bg-background rounded-lg flex items-center justify-center">
                <span className="text-[10px] text-gray-400">
                  boutique-diary.com
                </span>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex flex-col min-h-[400px]">
            {/* Header */}
            <div
              className={cn(
                "transition-all",
                activeSection === "header" &&
                  "ring-2 ring-primary ring-offset-1",
              )}
            >
              <StoreNavbar
                headerConfig={
                  currentValues.headerConfig as HeaderConfig | undefined
                }
                previewMode
              />
            </div>

            {/* Hero */}
            <div
              className={cn(
                "transition-all",
                activeSection === "hero" && "ring-2 ring-primary ring-offset-1",
              )}
            >
              <DiaryHero
                heroConfig={currentValues.heroConfig as HeroConfig | undefined}
                previewMode
              />
            </div>

            {/* Sections */}
            <div
              className={cn(
                "flex-1 transition-all",
                activeSection === "sections" &&
                  "ring-2 ring-primary ring-offset-1",
              )}
            >
              <SectionsPreview
                config={currentValues.sectionsConfig as SectionsConfig | null}
                primaryColor={currentValues.primaryColor}
                secondaryColor={currentValues.secondaryColor}
              />
            </div>

            {/* Footer */}
            <StoreFooter />
          </div>
        </div>
      </div>

      {/* Active Section Indicator */}
      <div className="px-4 py-2 border-t border-border bg-background flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground">
            Section active:{" "}
            <span className="font-bold capitalize">{activeSection}</span>
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">
            Footer is static
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          Couleurs:
          <span
            className="inline-block w-3 h-3 rounded-full ml-1 border border-gray-200"
            style={{ backgroundColor: currentValues.primaryColor }}
          />
          <span
            className="inline-block w-3 h-3 rounded-full ml-1 border border-gray-200"
            style={{ backgroundColor: currentValues.secondaryColor }}
          />
        </span>
      </div>
    </div>
  );
}
