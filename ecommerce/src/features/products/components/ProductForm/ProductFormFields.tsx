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
      {}
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

      {}
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

      {}
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
          <div className="h-9 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            {categories.find(c => c.id === formData.categoryId)?.name ||
              "Non classé"}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-500 dark:text-gray-400 text-xs">
            Statuts (Synchronisé)
          </Label>
          <div className="flex gap-2">
            <div
              className={`h-9 px-3 rounded-md border flex items-center text-sm ${formData.isNew ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"}`}
            >
              {formData.isNew ? "Nouveauté" : "Standard"}
            </div>
            <div
              className={`h-9 px-3 rounded-md border flex items-center text-sm ${formData.isPromotion ? "bg-red-50 border-red-200 text-red-700" : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"}`}
            >
              {formData.isPromotion ? "Promo" : "Standard"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
