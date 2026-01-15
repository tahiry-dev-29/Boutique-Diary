"use client";

interface ThemeFontSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}

const DEFAULT_FONTS = [
  "Playfair Display",
  "Montserrat",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
  "Raleway",
  "Oswald",
];

export function ThemeFontSelector({
  label,
  value,
  onChange,
  options = DEFAULT_FONTS,
}: ThemeFontSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
      >
        {options.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
      <div className="mt-2 rounded-md border border-gray-200 p-4 bg-gray-50/30">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">
          Aperçu
        </p>
        <p
          className="text-2xl leading-tight text-gray-900"
          style={{ fontFamily: `${value}, sans-serif` }}
        >
          The quick brown fox jumps over the lazy dog. 1234567890
        </p>
      </div>
    </div>
  );
}
