"use client";

import { Product } from "@/types/admin";
import { Category } from "@/types/category";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormFieldsProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  categories: Category[];
}

export function ProductFormFields({
  formData,
  setFormData,
  categories,
}: ProductFormFieldsProps) {
  const handleChange = (field: keyof Product, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReferenceChange = (newRef: string) => {
    setFormData((prev) => ({
      ...prev,
      reference: newRef,
      images: prev.images?.map((img, idx) => {
        if (typeof img === "string") return img;
        const suffix = img.color
          ? img.color.toLowerCase().slice(0, 3)
          : `img${idx + 1}`;
        return {
          ...img,
          reference: `${newRef}-${suffix}`,
        };
      }),
    }));
  };

  return (
    <div className="space-y-4">
      {/* Name and Reference */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nom du produit"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Référence *</Label>
          <Input
            id="reference"
            type="text"
            required
            value={formData.reference}
            onChange={(e) => handleReferenceChange(e.target.value)}
            placeholder="REF-001"
          />
        </div>
      </div>

      {/* Category and Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select
            value={formData.categoryId?.toString() || ""}
            onValueChange={(value) =>
              handleChange("categoryId", value ? parseInt(value) : null)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Non classé" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Non classé</SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id?.toString() || ""}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Marque</Label>
          <Input
            id="brand"
            type="text"
            value={formData.brand || ""}
            onChange={(e) => handleChange("brand", e.target.value)}
            placeholder="Marque du produit"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          placeholder="Description du produit..."
        />
      </div>
    </div>
  );
}
