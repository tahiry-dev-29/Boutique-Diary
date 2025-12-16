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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={e => handleChange("name", e.target.value)}
            placeholder="Nom du produit"
          />
        </div>
      </div>

      {/* Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="brand">Marque</Label>
          <Input
            id="brand"
            type="text"
            value={formData.brand || ""}
            onChange={e => handleChange("brand", e.target.value)}
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
          onChange={e => handleChange("description", e.target.value)}
          rows={4}
          placeholder="Description du produit..."
        />
      </div>

      {/* Synced Global Settings (Read-Only) */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <Label className="text-gray-500 dark:text-gray-400 text-xs">
            Catégorie (Synchronisé)
          </Label>
          <div className="h-9 px-0 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            {categories.find(c => c.id === formData.categoryId)?.name ||
              "Non classé (Sera défini par l'image principale)"}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-500 dark:text-gray-400 text-xs">
            Statuts (Synchronisé)
          </Label>
          <div className="flex gap-2">
            <div
              className={`h-9 px-0 rounded-md flex items-center text-sm font-medium ${formData.isNew ? "text-blue-600" : "text-gray-500"}`}
            >
              {formData.isNew ? "Nouveauté" : "Standard"}
            </div>
            <div
              className={`h-9 px-0 rounded-md flex items-center text-sm font-medium ${formData.isPromotion ? "text-red-600" : "text-gray-500"}`}
            >
              {formData.isPromotion ? "Promo" : "Standard"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
