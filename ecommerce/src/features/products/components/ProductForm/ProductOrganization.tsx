"use client";

import { Category } from "@/types/category";
import { Product } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ProductOrganizationProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  categories: Category[];
}

export function ProductOrganization({
  formData,
  setFormData,
  categories,
}: ProductOrganizationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organisation du produit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie Principale</Label>
          <Select
            value={formData.categoryId?.toString() || "uncategorized"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                categoryId: value === "uncategorized" ? null : parseInt(value),
              })
            }
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uncategorized">Non classé</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id?.toString() || ""}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Switches */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Nouveauté</Label>
            <p className="text-xs text-muted-foreground">
              Marquer comme nouveau produit
            </p>
          </div>
          <Switch
            checked={formData.isNew}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isNew: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">En Promotion</Label>
            <p className="text-xs text-muted-foreground">
              Marquer comme produit en promo
            </p>
          </div>
          <Switch
            checked={formData.isPromotion}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isPromotion: checked })
            }
          />
        </div>
        
         <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Meilleure vente</Label>
            <p className="text-xs text-muted-foreground">
              Marquer comme best-seller
            </p>
          </div>
          <Switch
            checked={formData.isBestSeller}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isBestSeller: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
