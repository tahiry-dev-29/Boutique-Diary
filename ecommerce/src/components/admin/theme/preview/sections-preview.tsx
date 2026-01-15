"use client";

import {
  SectionsConfig,
  SECTION_TYPE_LABELS,
  defaultSectionsConfig,
} from "@/lib/theme/theme-config";

interface SectionsPreviewProps {
  config: SectionsConfig | null | undefined;
  primaryColor?: string;
  secondaryColor?: string;
}

export function SectionsPreview({
  config,
  primaryColor = "#3d6b6b",
  secondaryColor = "#d4b8a5",
}: SectionsPreviewProps) {
  const sections = config || defaultSectionsConfig;
  const enabledSections = sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  if (enabledSections.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400 text-xs">
        Aucune section active
      </div>
    );
  }

  const getSectionPreview = (type: string, index: number) => {
    const bgColors = ["bg-white", "bg-gray-50", "bg-white"];
    const bg = bgColors[index % bgColors.length];

    switch (type) {
      case "promo":
        return (
          <div className={`p-3 ${bg}`}>
            <div className="flex gap-2">
              <div
                className="w-12 h-16 rounded-lg flex items-center justify-center text-white text-[8px] font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                -30%
              </div>
              <div
                className="w-12 h-16 rounded-lg flex items-center justify-center text-white text-[8px] font-bold"
                style={{ backgroundColor: secondaryColor }}
              >
                -20%
              </div>
              <div className="w-12 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-[8px] text-gray-400">
                PROMO
              </div>
            </div>
          </div>
        );

      case "collection":
        return (
          <div className={`p-3 ${bg} overflow-hidden`}>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-14 rounded-lg bg-gray-200 shrink-0 flex items-center justify-center"
                >
                  <span className="text-[8px] text-gray-400">{i}</span>
                </div>
              ))}
              <div className="w-10 h-14 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300">
                →
              </div>
            </div>
          </div>
        );

      case "features":
        return (
          <div className={`p-3 ${bg}`}>
            <div className="grid grid-cols-3 gap-2">
              {["⚡", "✨", "🌱"].map((icon, i) => (
                <div key={i} className="text-center">
                  <div className="w-6 h-6 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-xs mb-1">
                    {icon}
                  </div>
                  <p className="text-[6px] text-gray-500">Feature {i + 1}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "services":
        return (
          <div className={`p-3 ${bg}`}>
            <div className="flex justify-around">
              {["🚚", "↩️", "💳", "📦"].map((icon, i) => (
                <div key={i} className="text-center">
                  <span className="text-sm">{icon}</span>
                  <p className="text-[6px] text-gray-400 mt-0.5">Service</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "banner":
        return (
          <div
            className="p-4 text-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <p className="text-[10px] font-bold">MEILLEURE COLLECTION</p>
            <p className="text-[8px] opacity-80 mt-0.5">
              Découvrez nos nouveautés
            </p>
          </div>
        );

      case "products":
        return (
          <div className={`p-3 ${bg}`}>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-1">
                  <div className="w-full aspect-square bg-gray-200 rounded mb-1" />
                  <div className="h-1 w-3/4 bg-gray-200 rounded mb-0.5" />
                  <div className="h-1 w-1/2 bg-gray-300 rounded" />
                </div>
              ))}
            </div>
          </div>
        );

      case "testimonials":
        return (
          <div className={`p-3 ${bg}`}>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 bg-white rounded-lg p-2 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-4 h-4 rounded-full bg-gray-200" />
                    <div className="h-1 w-8 bg-gray-200 rounded" />
                  </div>
                  <div className="text-[6px] text-yellow-500">★★★★★</div>
                  <div className="h-1 w-full bg-gray-100 rounded mt-1" />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className={`p-2 ${bg} text-center text-gray-400 text-[10px]`}>
            {SECTION_TYPE_LABELS[type as keyof typeof SECTION_TYPE_LABELS] ||
              type}
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {enabledSections.map((section, index) => (
        <div key={section.id} className="relative group">
          {getSectionPreview(section.type, index)}
          {/* Section Label Overlay */}
          <div className="absolute top-0 left-0 text-[8px] bg-black/50 text-white px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-br">
            {section.order}. {SECTION_TYPE_LABELS[section.type]}
          </div>
        </div>
      ))}
    </div>
  );
}
