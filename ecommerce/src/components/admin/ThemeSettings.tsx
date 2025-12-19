"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTheme,
  THEME_PRESETS,
  ThemePreset,
  Scale,
  Radius,
  ColorMode,
  ContentLayout,
  SidebarMode,
} from "@/contexts/theme-context";

export function ThemeSettings() {
  const {
    preset,
    colorMode,
    scale,
    radius,
    contentLayout,
    sidebarMode,
    setPreset,
    setColorMode,
    setScale,
    setRadius,
    setContentLayout,
    setSidebarMode,
    resetTheme,
  } = useTheme();

  return (
    <div className="p-4 space-y-5">
      {}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Theme preset:</label>
        <Select value={preset} onValueChange={(v) => setPreset(v as ThemePreset)}>
          <SelectTrigger className="w-full h-9">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: THEME_PRESETS[preset].indicator }}
                />
                {THEME_PRESETS[preset].name}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((key) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: THEME_PRESETS[key].indicator }}
                  />
                  {THEME_PRESETS[key].name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Scale:</label>
        <div className="flex gap-2">
          {(["default", "xs", "lg"] as Scale[]).map((s) => (
            <Button
              key={s}
              variant={scale === s ? "default" : "outline"}
              size="sm"
              onClick={() => setScale(s)}
              className="flex-1 h-9"
            >
              {s === "default" ? "⊘" : s.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Radius:</label>
        <div className="flex gap-2">
          {(["default", "sm", "md", "lg", "xl"] as Radius[]).map((r) => (
            <Button
              key={r}
              variant={radius === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRadius(r)}
              className="flex-1 h-9 px-2"
            >
              {r === "default" ? "⊘" : r.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Color mode:</label>
        <div className="flex gap-2">
          {(["light", "dark"] as ColorMode[]).map((m) => (
            <Button
              key={m}
              variant={colorMode === m ? "default" : "outline"}
              size="sm"
              onClick={() => setColorMode(m)}
              className="flex-1 h-9 capitalize"
            >
              {m === "light" ? "Light" : "Dark"}
            </Button>
          ))}
        </div>
      </div>

      {}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Content layout:</label>
        <div className="flex gap-2">
          {(["full", "centered"] as ContentLayout[]).map((l) => (
            <Button
              key={l}
              variant={contentLayout === l ? "default" : "outline"}
              size="sm"
              onClick={() => setContentLayout(l)}
              className="flex-1 h-9 capitalize"
            >
              {l === "full" ? "Full" : "Centered"}
            </Button>
          ))}
        </div>
      </div>

      {}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Sidebar mode:</label>
        <div className="flex gap-2">
          {(["default", "icon"] as SidebarMode[]).map((m) => (
            <Button
              key={m}
              variant={sidebarMode === m ? "default" : "outline"}
              size="sm"
              onClick={() => setSidebarMode(m)}
              className="flex-1 h-9 capitalize"
            >
              {m === "default" ? "Default" : "Icon"}
            </Button>
          ))}
        </div>
      </div>

      {}
      <Button
        variant="destructive"
        size="sm"
        onClick={resetTheme}
        className="w-full h-9 bg-red-500 hover:bg-red-600"
      >
        Reset to Default
      </Button>
    </div>
  );
}
