"use client";

import { HeroConfig, defaultHeroConfig } from "@/lib/theme/theme-config";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Maximize,
  Columns,
  Play,
  Minus,
  ImageIcon,
  ExternalLink,
} from "lucide-react";

interface HeroEditorProps {
  value: HeroConfig | null | undefined;
  onChange: (config: HeroConfig) => void;
}

const HERO_STYLES = [
  { value: "large", label: "Grand", icon: Maximize, desc: "Plein écran" },
  { value: "split", label: "Divisé", icon: Columns, desc: "Texte + Image" },
  { value: "video", label: "Vidéo", icon: Play, desc: "Fond vidéo" },
  { value: "minimal", label: "Minimal", icon: Minus, desc: "Texte simple" },
];

export function HeroEditor({ value, onChange }: HeroEditorProps) {
  const config = value || defaultHeroConfig;

  const update = (partial: Partial<HeroConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* Style Picker */}
      <div className="space-y-3">
        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Style du Hero
        </Label>
        <div className="grid grid-cols-4 gap-3">
          {HERO_STYLES.map((style) => {
            const isActive = config.style === style.value;
            return (
              <button
                key={style.value}
                type="button"
                onClick={() =>
                  update({ style: style.value as HeroConfig["style"] })
                }
                className={`group relative p-4 rounded-2xl border-2 transition-all text-left ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <style.icon
                  className={`w-5 h-5 mb-2 ${isActive ? "text-primary" : "text-gray-400"}`}
                />
                <p className="font-bold text-sm">{style.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {style.desc}
                </p>
                {isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Fields */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl border-gray-100 col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Contenu Texte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Titre Principal</Label>
              <Textarea
                value={config.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Accès à des produits Écologiques..."
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Sous-titre (optionnel)
              </Label>
              <Input
                value={config.subtitle || ""}
                onChange={(e) => update({ subtitle: e.target.value })}
                placeholder="Description courte..."
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Button */}
      <Card className="rounded-2xl border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Bouton d&apos;Action (CTA)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Texte du bouton</Label>
            <Input
              value={config.ctaText}
              onChange={(e) => update({ ctaText: e.target.value })}
              placeholder="Contactez-nous"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Lien</Label>
            <Input
              value={config.ctaLink}
              onChange={(e) => update({ ctaLink: e.target.value })}
              placeholder="/contact"
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Background */}
      <Card className="rounded-2xl border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Image de Fond
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">URL de l&apos;image</Label>
            <Input
              value={config.bgImage || ""}
              onChange={(e) => update({ bgImage: e.target.value })}
              placeholder="https://... ou /images/hero.jpg"
              className="h-10"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="overlay" className="text-sm font-medium">
              Activer l&apos;overlay sombre
            </Label>
            <Switch
              id="overlay"
              checked={config.overlay}
              onCheckedChange={(checked) => update({ overlay: checked })}
            />
          </div>

          {config.overlay && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Opacité overlay</Label>
                <span className="text-sm font-bold text-primary">
                  {Math.round(config.overlayOpacity * 100)}%
                </span>
              </div>
              <Slider
                value={[config.overlayOpacity]}
                onValueChange={([val]) => update({ overlayOpacity: val })}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {config.bgImage && (
        <div
          className="relative rounded-2xl overflow-hidden h-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.bgImage})` }}
        >
          {config.overlay && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: config.overlayOpacity }}
            />
          )}
          <div className="relative z-10 flex items-center justify-center h-full text-white text-center p-4">
            <div>
              <h3 className="font-bold text-lg">
                {config.title.slice(0, 30)}...
              </h3>
              {config.subtitle && (
                <p className="text-sm opacity-80">{config.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
