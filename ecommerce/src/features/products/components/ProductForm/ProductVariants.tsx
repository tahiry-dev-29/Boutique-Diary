"use client";

import { Product } from "@/types/admin";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { AVAILABLE_COLORS, AVAILABLE_SIZES } from "@/lib/constants";

interface ProductVariantsProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
}

export function ProductVariants({
  formData,
  setFormData,
}: ProductVariantsProps) {
  const addColor = (color: string) => {
    if (color && !formData.colors?.includes(color)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...(prev.colors || []), color],
      }));
    }
  };

  const removeColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors?.filter((c) => c !== color),
    }));
  };

  const addSize = (size: string) => {
    if (size && !formData.sizes?.includes(size)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...(prev.sizes || []), size],
      }));
    }
  };

  const removeSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes?.filter((s) => s !== size),
    }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Colors */}
      <div className="space-y-2">
        <Label>Couleurs</Label>
        <Select onValueChange={(value) => addColor(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Ajouter une couleur" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_COLORS.filter(
              (color) => !formData.colors?.includes(color),
            ).map((color) => (
              <SelectItem key={color} value={color}>
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-1 mt-2">
          {formData.colors?.map((color) => (
            <Badge
              key={color}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {color}
              <button
                type="button"
                onClick={() => removeColor(color)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <Label>Tailles</Label>
        <Select onValueChange={(value) => addSize(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Ajouter une taille" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_SIZES.filter(
              (size) => !formData.sizes?.includes(size),
            ).map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-1 mt-2">
          {formData.sizes?.map((size) => (
            <Badge
              key={size}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {size}
              <button
                type="button"
                onClick={() => removeSize(size)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
