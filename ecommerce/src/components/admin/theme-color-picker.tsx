import { HexAlphaColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ThemeColorPickerProps {
  label: string;
  value: string; // This will be hex with alpha, e.g., #rrggbbaa
  onChange: (value: string) => void;
  className?: string;
}

export function ThemeColorPicker({
  label,
  value,
  onChange,
  className,
}: ThemeColorPickerProps) {
  // Ensure we have a valid hex with alpha, or default to #000000ff
  const colorValue = value?.startsWith("#") ? value : "#3d6b6bff";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
          {label}
        </label>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          {colorValue}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-8 w-8 rounded-lg border border-border shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: colorValue }}
              aria-label={`Choisir la couleur ${label}`}
            />
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-3 border-border shadow-xl rounded-xl"
            align="start"
          >
            <HexAlphaColorPicker color={colorValue} onChange={onChange} />
          </PopoverContent>
        </Popover>

        <input
          type="text"
          value={colorValue}
          onChange={e => onChange(e.target.value)}
          className="flex-1 h-8 rounded-lg border border-border bg-background px-3 py-1 text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono transition-all"
          placeholder="#rrggbbaa"
        />
      </div>
    </div>
  );
}
