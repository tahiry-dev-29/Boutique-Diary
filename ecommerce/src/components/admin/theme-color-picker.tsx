"use client";

interface ThemeColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ThemeColorPicker({
  label,
  value,
  onChange,
}: ThemeColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded border border-gray-300 p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="#000000"
        />
      </div>
      <div
        className="h-24 w-full rounded-md shadow-sm transition-colors duration-200"
        style={{ backgroundColor: value }}
      >
        <div className="flex h-full items-center justify-center text-white/80 font-medium">
          Preview
        </div>
      </div>
    </div>
  );
}
