"use client";

import { HeroConfig, defaultHeroConfig } from "@/lib/theme/theme-config";
import { ArrowRight } from "lucide-react";

interface HeroPreviewProps {
  config: HeroConfig | null | undefined;
  primaryColor?: string;
}

export function HeroPreview({
  config,
  primaryColor = "#3d6b6b",
}: HeroPreviewProps) {
  const cfg = config || defaultHeroConfig;

  const getLayoutClass = () => {
    switch (cfg.style) {
      case "split":
        return "flex-row";
      case "minimal":
        return "py-4";
      case "video":
      case "large":
      default:
        return "py-8";
    }
  };

  return (
    <section
      className={`relative w-full px-4 overflow-hidden ${getLayoutClass()}`}
      style={{
        backgroundColor: cfg.bgImage
          ? "transparent"
          : "var(--background, #ffffff)",
        backgroundImage: cfg.bgImage ? `url(${cfg.bgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      {cfg.bgImage && cfg.overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: cfg.overlayOpacity }}
        />
      )}

      {/* Content */}
      <div
        className={`relative z-10 ${cfg.style === "split" ? "max-w-[60%]" : "w-full text-center"}`}
      >
        {/* Title */}
        <h1
          className={`font-bold leading-tight mb-2 ${
            cfg.style === "minimal" ? "text-lg" : "text-xl md:text-2xl"
          } ${cfg.bgImage && cfg.overlay ? "text-white" : "text-gray-900"}`}
        >
          {cfg.title.length > 50 ? cfg.title.slice(0, 50) + "..." : cfg.title}
        </h1>

        {/* Subtitle */}
        {cfg.subtitle && (
          <p
            className={`text-xs mb-3 ${cfg.bgImage && cfg.overlay ? "text-gray-200" : "text-gray-500"}`}
          >
            {cfg.subtitle}
          </p>
        )}

        {/* CTA Button */}
        <button
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-[10px] font-medium shadow-sm transition-all hover:shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          {cfg.ctaText}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Split Layout Image Placeholder */}
      {cfg.style === "split" && (
        <div className="absolute right-0 top-0 w-[40%] h-full bg-gray-100 flex items-center justify-center">
          <span className="text-[10px] text-gray-400">Image</span>
        </div>
      )}

      {/* Style Badge */}
      <div className="absolute bottom-1 right-1 text-[8px] bg-purple-100 text-purple-600 px-1 rounded capitalize">
        {cfg.style}
      </div>
    </section>
  );
}
