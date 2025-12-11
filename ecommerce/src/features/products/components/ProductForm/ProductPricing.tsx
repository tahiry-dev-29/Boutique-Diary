"use client";

import { Product } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductPricingProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
}

export function ProductPricing({ formData, setFormData }: ProductPricingProps) {
  const handleChange = (field: keyof Product, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      {}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">
            {formData.isPromotion ? "Prix promo (Ar)" : "Prix (Ar)"} *
          </Label>
          <Input
            id="price"
            type="number"
            required
            min="0"
            step="0.01"
            value={isNaN(formData.price) ? "" : formData.price}
            onChange={(e) => handleChange("price", parseFloat(e.target.value))}
            placeholder="0.00"
          />
        </div>

        {formData.isPromotion && (
          <div className="space-y-2">
            <Label htmlFor="oldPrice">Ancien prix (Ar)</Label>
            <Input
              id="oldPrice"
              type="number"
              min="0"
              step="0.01"
              value={
                formData.oldPrice === null || isNaN(formData.oldPrice as number)
                  ? ""
                  : formData.oldPrice
              }
              onChange={(e) =>
                handleChange(
                  "oldPrice",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              placeholder="0.00"
            />
          </div>
        )}
      </div>

      {}
      <div className="space-y-3">
        <Label>Type de produit</Label>
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNew"
              checked={formData.isNew || false}
              onCheckedChange={(checked) => handleChange("isNew", checked)}
            />
            <label
              htmlFor="isNew"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Nouveau
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPromotion"
              checked={formData.isPromotion || false}
              onCheckedChange={(checked) =>
                handleChange("isPromotion", checked)
              }
            />
            <label
              htmlFor="isPromotion"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Promotion
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isBestSeller"
              checked={formData.isBestSeller || false}
              onCheckedChange={(checked) =>
                handleChange("isBestSeller", checked)
              }
            />
            <label
              htmlFor="isBestSeller"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Best-seller
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
