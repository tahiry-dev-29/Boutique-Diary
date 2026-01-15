"use client";

import { HeaderConfig, defaultHeaderConfig } from "@/lib/theme/theme-config";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Menu, AlignCenter, Minus } from "lucide-react";

interface HeaderEditorProps {
  value: HeaderConfig | null | undefined;
  onChange: (config: HeaderConfig) => void;
}

const HEADER_STYLES = [
  {
    value: "classic",
    label: "Classique",
    icon: Menu,
    desc: "Logo à gauche, nav au centre",
  },
  { value: "minimal", label: "Minimal", icon: Minus, desc: "Ultra épuré" },
  {
    value: "centered",
    label: "Centré",
    icon: AlignCenter,
    desc: "Logo au centre",
  },
];

export function HeaderEditor({ value, onChange }: HeaderEditorProps) {
  const config = value || defaultHeaderConfig;

  const update = (partial: Partial<HeaderConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* Style Picker */}
      <div className="space-y-3">
        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Style du Header
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {HEADER_STYLES.map((style) => {
            const isActive = config.style === style.value;
            return (
              <button
                key={style.value}
                type="button"
                onClick={() =>
                  update({ style: style.value as HeaderConfig["style"] })
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

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Comportement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sticky" className="text-sm font-medium">
                Header fixe (sticky)
              </Label>
              <Switch
                id="sticky"
                checked={config.sticky}
                onCheckedChange={(checked) => update({ sticky: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="transparent" className="text-sm font-medium">
                Fond transparent
              </Label>
              <Switch
                id="transparent"
                checked={config.transparent}
                onCheckedChange={(checked) => update({ transparent: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Couleur de fond</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.bgColor || "#ffffff"}
                  onChange={(e) => update({ bgColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border-2 border-gray-100 cursor-pointer"
                />
                <Input
                  value={config.bgColor || ""}
                  onChange={(e) => update({ bgColor: e.target.value })}
                  placeholder="Auto (transparent)"
                  className="flex-1 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Position du logo</Label>
              <Select
                value={config.logoPosition}
                onValueChange={(val) =>
                  update({ logoPosition: val as HeaderConfig["logoPosition"] })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
