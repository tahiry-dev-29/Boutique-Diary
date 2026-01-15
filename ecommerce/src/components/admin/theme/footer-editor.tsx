"use client";

import { FooterConfig, defaultFooterConfig } from "@/lib/theme/theme-config";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

interface FooterEditorProps {
  value: FooterConfig | null | undefined;
  onChange: (config: FooterConfig) => void;
}

export function FooterEditor({ value, onChange }: FooterEditorProps) {
  const config = value || defaultFooterConfig;

  const update = (partial: Partial<FooterConfig>) => {
    onChange({ ...config, ...partial });
  };

  const updateSocial = (key: string, val: string) => {
    update({
      socialLinks: { ...config.socialLinks, [key]: val },
    });
  };

  return (
    <div className="space-y-6">
      {/* Color Pickers */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Couleurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fond</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={e => update({ bgColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border-2 border-gray-100 cursor-pointer"
                />
                <Input
                  value={config.bgColor}
                  onChange={e => update({ bgColor: e.target.value })}
                  className="flex-1 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Texte</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.textColor}
                  onChange={e => update({ textColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border-2 border-gray-100 cursor-pointer"
                />
                <Input
                  value={config.textColor}
                  onChange={e => update({ textColor: e.target.value })}
                  className="flex-1 h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Éléments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="newsletter" className="text-sm font-medium">
                Afficher Newsletter
              </Label>
              <Switch
                id="newsletter"
                checked={config.showNewsletter}
                onCheckedChange={checked => update({ showNewsletter: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="social" className="text-sm font-medium">
                Afficher Réseaux Sociaux
              </Label>
              <Switch
                id="social"
                checked={config.showSocial}
                onCheckedChange={checked => update({ showSocial: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Copyright */}
      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Texte de Copyright
        </Label>
        <Input
          value={config.copyrightText}
          onChange={e => update({ copyrightText: e.target.value })}
          placeholder="© 2026 Diary Boutique. Tous droits réservés."
          className="h-12"
        />
      </div>

      {/* Social Links */}
      {config.showSocial && (
        <Card className="rounded-2xl border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Liens Réseaux Sociaux
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Facebook className="w-5 h-5 text-blue-600" />
              <Input
                value={config.socialLinks?.facebook || ""}
                onChange={e => updateSocial("twitter", e.target.value)}
                placeholder="https://facebook.com/..."
                className="h-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-600" />
              <Input
                value={config.socialLinks?.instagram || ""}
                onChange={e => updateSocial("instagram", e.target.value)}
                placeholder="https://instagram.com/..."
                className="h-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-700" />
              <Input
                value={config.socialLinks?.linkedin || ""}
                onChange={e => updateSocial("linkedin", e.target.value)}
                placeholder="https://linkedin.com/..."
                className="h-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="w-5 h-5 text-sky-500" />
              <Input
                value={config.socialLinks?.twitter || ""}
                onChange={e => updateSocial("twitter", e.target.value)}
                placeholder="https://twitter.com/..."
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      <div className="rounded-2xl overflow-hidden border border-gray-100">
        <div
          className="p-6 text-center"
          style={{ backgroundColor: config.bgColor, color: config.textColor }}
        >
          <p className="text-xs opacity-80">{config.copyrightText}</p>
        </div>
      </div>
    </div>
  );
}
