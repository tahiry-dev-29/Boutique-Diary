"use client";

import { Product } from "@/types/admin";
import { Category } from "@/types/category";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


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



  return (
    <div className="space-y-4">
      {}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
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
      </div>

      {}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
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

      {}
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
