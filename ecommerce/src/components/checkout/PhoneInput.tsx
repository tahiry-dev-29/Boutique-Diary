"use client";

import { useState } from "react";
import "react-phone-number-input/style.css";
import PhoneInputFromLib, {
  isPossiblePhoneNumber,
} from "react-phone-number-input";
import { Check, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function PhoneInput({
  value,
  onChange,
  error,
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const normalizePhone = (phone: string) => {
    if (!phone) return "";
    // If it starts with 0 (Malagasy local format), prefix with +261
    if (phone.startsWith("0") && phone.replace(/\s/g, "").length >= 10) {
      return "+261" + phone.replace(/\s/g, "").slice(1);
    }
    return phone;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Smartphone className="w-4 h-4" />
        Numéro de téléphone{" "}
        <span className="text-xs opacity-50 ml-auto flex items-center gap-1">
          🇲🇬 MG
        </span>
      </label>
      <div
        className={cn(
          "relative border rounded-xl overflow-hidden bg-white transition-all duration-300",
          error
            ? "border-red-500 ring-2 ring-red-100"
            : isFocused
              ? "border-black ring-2 ring-black/5"
              : "border-gray-200 hover:border-gray-300",
        )}
      >
        <PhoneInputFromLib
          international
          defaultCountry="MG"
          value={normalizePhone(value)}
          onChange={val => onChange(val as string)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex h-12 px-4 focus:outline-none [&>.PhoneInputCountry]:mr-3 [&>input]:bg-transparent [&>input]:outline-none [&>input]:placeholder:text-gray-400 [&>input]:font-medium"
        />
        {value && isPossiblePhoneNumber(value) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 animate-in fade-in zoom-in">
            <Check className="w-5 h-5" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
