"use client";

import { HeaderConfig, defaultHeaderConfig } from "@/lib/theme/theme-config";
import { cn } from "@/lib/utils";
import { Search, ShoppingBag, User } from "lucide-react";

interface HeaderPreviewProps {
  config: HeaderConfig | null | undefined;
  primaryColor?: string;
}

export function HeaderPreview({
  config,
  primaryColor = "#3d6b6b",
}: HeaderPreviewProps) {
  const cfg = config || defaultHeaderConfig;

  const getLogoPosition = () => {
    if (cfg.logoPosition === "center") return "justify-center";
    return "justify-start";
  };

  const getNavPosition = () => {
    if (cfg.style === "centered") return "order-first";
    if (cfg.style === "minimal") return "hidden";
    return "";
  };

  return (
    <nav
      className={cn(
        "w-full px-4 py-3 border-b transition-all",
        cfg.transparent
          ? "bg-transparent border-transparent"
          : "bg-white/90 border-gray-100",
      )}
      style={{
        backgroundColor: cfg.transparent
          ? "transparent"
          : cfg.bgColor || "rgba(255,255,255,0.9)",
      }}
    >
      <div className="max-w-full mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className={cn("flex items-center gap-2", getLogoPosition())}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ backgroundColor: primaryColor }}
          >
            D
          </div>
          <span className="font-bold text-sm">Diary Boutique</span>
        </div>

        {/* Navigation */}
        <div
          className={cn("flex items-center gap-4 text-xs", getNavPosition())}
        >
          {cfg.style !== "minimal" && (
            <>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">
                Accueil
              </span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">
                Boutique
              </span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">
                Blog
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <Search className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <User className="w-4 h-4 text-gray-500" />
          </button>
          <button
            className="p-1.5 rounded-full text-white transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Style Indicators */}
      {cfg.sticky && (
        <div className="absolute top-1 right-1 text-[8px] bg-blue-100 text-blue-600 px-1 rounded">
          sticky
        </div>
      )}
    </nav>
  );
}
