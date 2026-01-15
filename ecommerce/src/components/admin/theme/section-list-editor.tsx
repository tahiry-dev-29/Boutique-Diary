"use client";

import { useState } from "react";
import {
  SectionConfig,
  SectionsConfig,
  SECTION_TYPE_LABELS,
  defaultSectionsConfig,
} from "@/lib/theme/theme-config";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  GripVertical,
  Eye,
  EyeOff,
  Tag,
  Layers,
  Sparkles,
  Truck,
  Image,
  LayoutGrid,
  MessageSquare,
} from "lucide-react";

interface SectionListEditorProps {
  value: SectionsConfig | null | undefined;
  onChange: (config: SectionsConfig) => void;
}

const SECTION_ICONS: Record<SectionConfig["type"], typeof Tag> = {
  promo: Tag,
  collection: Layers,
  features: Sparkles,
  services: Truck,
  banner: Image,
  products: LayoutGrid,
  testimonials: MessageSquare,
};

const SECTION_DESCRIPTIONS: Record<SectionConfig["type"], string> = {
  promo: "Section promotions et offres spéciales",
  collection: "Scroll horizontal des collections",
  features: "Points forts et statistiques",
  services: "Avantages et services",
  banner: "Grande bannière visuelle",
  products: "Grille de produits vedettes",
  testimonials: "Avis et témoignages clients",
};

export function SectionListEditor({ value, onChange }: SectionListEditorProps) {
  const sections = value || defaultSectionsConfig;
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    onChange(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const sorted = [...sections];
    const draggedIndex = sorted.findIndex((s) => s.id === draggedId);
    const targetIndex = sorted.findIndex((s) => s.id === targetId);

    // Swap orders
    const [moved] = sorted.splice(draggedIndex, 1);
    sorted.splice(targetIndex, 0, moved);

    // Update order values
    const reordered = sorted.map((s, i) => ({ ...s, order: i + 1 }));
    onChange(reordered);
    setDraggedId(null);
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Sections de la Page d&apos;Accueil
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Glissez-déposez pour réorganiser. Activez/désactivez les sections.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {sections.filter((s) => s.enabled).length}/{sections.length} actives
        </div>
      </div>

      <div className="space-y-2">
        {sortedSections.map((section) => {
          const Icon = SECTION_ICONS[section.type];
          const isDragging = draggedId === section.id;

          return (
            <Card
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section.id)}
              className={`group rounded-2xl border-2 transition-all cursor-move ${
                isDragging
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                  : section.enabled
                    ? "border-gray-100 hover:border-gray-200"
                    : "border-gray-100 bg-gray-50/50 opacity-60"
              }`}
            >
              <CardContent className="flex items-center gap-4 p-4">
                {/* Drag Handle */}
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {section.order}
                  </span>
                </div>

                {/* Section Icon & Info */}
                <div
                  className={`p-2 rounded-xl ${
                    section.enabled
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">
                    {SECTION_TYPE_LABELS[section.type]}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {SECTION_DESCRIPTIONS[section.type]}
                  </p>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-3">
                  {section.enabled ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-300" />
                  )}
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Bar */}
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Ordre d&apos;affichage
        </p>
        <div className="flex flex-wrap gap-2">
          {sortedSections
            .filter((s) => s.enabled)
            .map((section, index) => (
              <div
                key={section.id}
                className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold"
              >
                <span className="opacity-60">{index + 1}.</span>
                {SECTION_TYPE_LABELS[section.type]}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
