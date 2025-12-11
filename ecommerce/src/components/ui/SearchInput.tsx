"use client";

import * as React from "react";
import { Input } from "./input";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Rechercher...",
  containerClassName,
  className,
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative", containerClassName)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-9 pr-9", className)}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
