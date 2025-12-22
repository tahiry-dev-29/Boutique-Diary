"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface StoreProductFiltersProps {
  categories: Category[];
  selectedCategoryId?: number | null;
  onCategoryChange: (id: number | null) => void;
  className?: string;
}

export default function StoreProductFilters({
  categories,
  selectedCategoryId,
  onCategoryChange,
  className,
}: StoreProductFiltersProps) {
  return (
    <div className={cn("flex flex-col gap-4 mb-8", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <h3 className="font-black text-sm uppercase tracking-widest text-gray-900">
            Filtres
          </h3>
        </div>

        {selectedCategoryId && (
          <button
            onClick={() => onCategoryChange(null)}
            className="text-xs font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
            !selectedCategoryId
              ? "bg-black text-white border-black shadow-lg shadow-black/10"
              : "bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100",
          )}
        >
          Tous les articles
        </button>

        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              selectedCategoryId === category.id
                ? "bg-black text-white border-black shadow-lg shadow-black/10"
                : "bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100",
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
