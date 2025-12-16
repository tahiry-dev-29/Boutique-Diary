"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Product, ProductVariation } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, RefreshCw, Plus, Trash2, Tag } from "lucide-react";
import { AVAILABLE_COLORS, AVAILABLE_SIZES, COLOR_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePromotionRules } from "@/features/marketing/hooks/use-promotion-rules";

interface ProductVariantsProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
}

export function ProductVariants({
  formData,
  setFormData,
}: ProductVariantsProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const { rules } = usePromotionRules();
  // Active rules for dropdown
  const activeRules = rules.filter(r => r.isActive);

  // Sync internal state with formData on mount
  useEffect(() => {
    if (formData.colors) setSelectedColors(formData.colors);
    if (formData.sizes) setSelectedSizes(formData.sizes);
  }, [formData.colors, formData.sizes]);

  const toggleSelection = (
    list: string[],
    setList: (l: string[]) => void,
    item: string,
    field: "colors" | "sizes",
  ) => {
    const newList = list.includes(item)
      ? list.filter(i => i !== item)
      : [...list, item];
    setList(newList);
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  const generateVariants = () => {
    const colors = selectedColors.length > 0 ? selectedColors : [null];
    const sizes = selectedSizes.length > 0 ? selectedSizes : [null];

    const currentVariations = formData.variations || [];
    const newVariations: ProductVariation[] = [];

    colors.forEach(color => {
      sizes.forEach(size => {
        // Check if exists
        const exists = currentVariations.find(
          v => v.color === color && v.size === size,
        );

        if (exists) {
          newVariations.push(exists);
        } else {
          // Generate SKU: REF-COL-SIZ
          // REF was set in formData.reference
          // If no color/size, maybe just increment?
          // Simplification: REF-COLOR-SIZE
          const skuParts = [formData.reference];
          if (color)
            skuParts.push(
              color
                .replace(/[^a-zA-Z0-9]/g, "")
                .toUpperCase()
                .slice(0, 3),
            );
          if (size)
            skuParts.push(size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
          const sku = skuParts.join("-");

          newVariations.push({
            sku,
            price: formData.price || 0,
            stock: 0,
            color: color || "",
            size: size || "",
            isActive: true,
            id: 0, // Temporary ID for new items
          });
        }
      });
    });

    setFormData(prev => ({ ...prev, variations: newVariations }));
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariation,
    value: any,
  ) => {
    const newVariations = [...(formData.variations || [])];
    newVariations[index] = { ...newVariations[index], [field]: value };
    setFormData(prev => ({ ...prev, variations: newVariations }));
  };

  // Helper to apply promotion to a specific variant row (calculates price)
  const applyPromotionToVariant = (index: number, ruleId: string) => {
    const rule = rules.find(r => r.id.toString() === ruleId);
    if (!rule) return;

    const actions =
      typeof rule.actions === "string"
        ? JSON.parse(rule.actions)
        : rule.actions;
    let discountPercent = 0;
    if (actions.discountPercentage)
      discountPercent = parseFloat(actions.discountPercentage);
    else if (actions.percentage)
      discountPercent = parseFloat(actions.percentage);
    else if (actions.discount_percent)
      discountPercent = parseFloat(actions.discount_percent);

    if (discountPercent > 0) {
      const basePrice = formData.price || 0;
      const discountedPrice = basePrice * (1 - discountPercent / 100);
      // Round to 2 decimals
      const finalPrice = Math.round(discountedPrice * 100) / 100;

      updateVariant(index, "price", finalPrice);
      toast.success(`Promotion "${rule.name}" appliquée: -${discountPercent}%`);
    }
  };

  const clearVariants = () => {
    setFormData(prev => ({ ...prev, variations: [] }));
  };

  return (
    <div className="space-y-6">
      {/* Generator Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colors */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-base font-semibold">
              Couleurs disponibles
            </Label>
            <Badge variant="secondary" className="font-mono text-xs">
              {selectedColors.length} sélectionnée(s)
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-card">
            {AVAILABLE_COLORS.map(color => {
              const isSelected = selectedColors.includes(color);
              const bgStyle = COLOR_MAP[color] || color;

              return (
                <div
                  key={color}
                  onClick={() =>
                    toggleSelection(
                      selectedColors,
                      setSelectedColors,
                      color,
                      "colors",
                    )
                  }
                  className={cn(
                    "cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-2 select-none",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:bg-muted text-muted-foreground border-border",
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full border border-black/10 shadow-sm"
                    style={{ background: bgStyle }}
                  />
                  {color}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-base font-semibold">
              Tailles disponibles
            </Label>
            <Badge variant="secondary" className="font-mono text-xs">
              {selectedSizes.length} sélectionnée(s)
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-card">
            {AVAILABLE_SIZES.map(size => {
              const isSelected = selectedSizes.includes(size);
              return (
                <div
                  key={size}
                  onClick={() =>
                    toggleSelection(
                      selectedSizes,
                      setSelectedSizes,
                      size,
                      "sizes",
                    )
                  }
                  className={cn(
                    "cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold border transition-all select-none",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:bg-muted text-muted-foreground border-border",
                  )}
                >
                  {size}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Sélectionnez les attributs puis cliquez sur générer pour créer le
          tableau de stock.
        </div>
        <div className="flex gap-2">
          {formData.variations && formData.variations.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={clearVariants}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Tout effacer
            </Button>
          )}
          <Button
            type="button"
            onClick={generateVariants}
            variant="secondary"
            className="bg-black dark:bg-white text-white dark:text-gray-900 border-none shadow-md hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Générer les variantes
          </Button>
        </div>
      </div>

      {/* Variants Table */}
      {formData.variations && formData.variations.length > 0 && (
        <div className="border rounded-xl overflow-hidden bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold w-32">SKU</TableHead>
                <TableHead className="font-semibold">Combinaison</TableHead>
                <TableHead className="font-semibold w-48">
                  Appliquer Promo
                </TableHead>
                <TableHead className="font-semibold w-40 text-right">
                  Prix Spécifique
                </TableHead>
                <TableHead className="font-semibold w-32 text-center">
                  Stock Spécifique
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.variations.map((variant, index) => (
                <TableRow
                  key={index}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <Input
                      value={variant.sku}
                      onChange={e =>
                        updateVariant(index, "sku", e.target.value)
                      }
                      className="h-8 font-mono text-xs bg-transparent border-transparent group-hover:bg-background group-hover:border-input focus:bg-background focus:border-ring transition-all"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {variant.color && (
                        <Badge
                          variant="outline"
                          className="bg-background/50 gap-1.5 pl-1.5 text-xs font-normal"
                        >
                          <span
                            className="w-2 h-2 rounded-full border shadow-sm"
                            style={{
                              background:
                                COLOR_MAP[variant.color] || variant.color,
                            }}
                          ></span>
                          {variant.color}
                        </Badge>
                      )}
                      {variant.size && (
                        <Badge
                          variant="outline"
                          className="bg-background/50 text-xs font-normal"
                        >
                          {variant.size}
                        </Badge>
                      )}
                      {!variant.color && !variant.size && (
                        <span className="text-muted-foreground text-sm italic">
                          Par défaut
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      onValueChange={val => applyPromotionToVariant(index, val)}
                    >
                      <SelectTrigger className="h-8 text-xs w-full bg-transparent border-dashed hover:bg-accent hover:border-solid text-muted-foreground">
                        <SelectValue placeholder="Choisir règle..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeRules.map(rule => (
                          <SelectItem key={rule.id} value={rule.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{rule.name}</span>
                              {(() => {
                                try {
                                  const act =
                                    typeof rule.actions === "string"
                                      ? JSON.parse(rule.actions)
                                      : rule.actions;
                                  const pct =
                                    act?.discountPercentage ||
                                    act?.percentage ||
                                    act?.discount_percent;
                                  return pct ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] h-5 px-1 py-0"
                                    >
                                      -{pct}%
                                    </Badge>
                                  ) : null;
                                } catch {
                                  return null;
                                }
                              })()}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <Input
                        type="number"
                        value={variant.price}
                        onChange={e =>
                          updateVariant(index, "price", Number(e.target.value))
                        }
                        className="h-9 w-full pl-4 text-right font-medium"
                      />
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">
                        Ar
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={e =>
                        updateVariant(index, "stock", Number(e.target.value))
                      }
                      className="h-9 w-full text-center font-medium bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900 focus:border-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-400 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newVars = formData.variations?.filter(
                          (_, i) => i !== index,
                        );
                        setFormData(prev => ({ ...prev, variations: newVars }));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
