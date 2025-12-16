import { toast } from "sonner";
import { Product, ProductVariation, ProductImage } from "@/types/admin";
import { Input } from "@/components/ui/input";
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
import { X, RefreshCw, Trash2, Image as ImageIcon } from "lucide-react";
import { usePromotionRules } from "@/features/marketing/hooks/use-promotion-rules";

interface ProductVariantsProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
}

export function ProductVariants({
  formData,
  setFormData,
}: ProductVariantsProps) {
  const { rules } = usePromotionRules();
  const activeRules = rules.filter(r => r.isActive);

  const generateVariants = () => {
    const images = formData.images || [];
    const newVariations: ProductVariation[] = [];
    const existingVariations = formData.variations || [];

    if (images.length === 0) {
      toast.error("Veuillez d'abord ajouter des images à l'étape précédente.");
      return;
    }

    let generatedCount = 0;

    images.forEach((img, index) => {
      // Skip if it's a string (shouldn't happen with new uploader, but for safety)
      if (typeof img === "string") return;

      const productImg = img as ProductImage;
      const baseRef = productImg.reference || `IMG${index + 1}`;
      const color = productImg.color;
      const sizes =
        productImg.sizes && productImg.sizes.length > 0
          ? productImg.sizes
          : [null]; // If no size, create one variant for the image itself

      sizes.forEach(size => {
        // Construct SKU: REF-SIZE (or just REF if no size)
        const skuSuffix = size
          ? `-${size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`
          : "";
        const sku = `${baseRef}${skuSuffix}`;

        // Check if exists to preserve Price/Stock if re-generating
        const exists = existingVariations.find(v => v.sku === sku);

        if (exists) {
          newVariations.push(exists);
        } else {
          // Inherit promotion from image if set
          const inheritedRuleId =
            productImg.promotionRuleId || formData.promotionRuleId || null;

          newVariations.push({
            sku,
            price: 0, // Default to 0, user must input
            oldPrice: null,
            stock: 0,
            color: color || null,
            size: size || null,
            isActive: true, // Default active
            promotionRuleId: inheritedRuleId,
            // We can store a reference to source image index if needed, but SKU link is better
          });
          generatedCount++;
        }
      });
    });

    setFormData(prev => ({ ...prev, variations: newVariations }));
    if (generatedCount > 0) {
      toast.success(`${generatedCount} nouvelles variantes générées.`);
    } else {
      toast.info("Variantes mises à jour (aucune nouvelle combinaison).");
    }
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

  const applyPromotionToVariant = (index: number, ruleId: string) => {
    const rule = rules.find(r => r.id.toString() === ruleId);
    // If clearing rule
    if (!rule && ruleId === "none") {
      const newVariations = [...(formData.variations || [])];
      newVariations[index] = {
        ...newVariations[index],
        promotionRuleId: null,
        oldPrice: null,
      };
      setFormData(prev => ({ ...prev, variations: newVariations }));
      return;
    }

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

    if (discountPercent > 0) {
      const currentPrice = Number(formData.variations?.[index].price || 0);
      // Logic: If applying promo, we assume currentPrice becomes oldPrice?
      // Or we assume user entered "Base Price" and we calculate "Discounted"?
      // User entered Price in the table. Let's assume that is the BASE price.
      // So we set oldPrice = currentPrice, and price = discounted.
      // WAIT: If re-applying, we might discount the discount.
      // Safer: Uses oldPrice if it exists as base, otherwise price.

      const basePrice = Number(
        formData.variations?.[index].oldPrice || currentPrice,
      );
      const discountedPrice = basePrice * (1 - discountPercent / 100);
      const finalPrice = Math.round(discountedPrice * 100) / 100;

      const newVariations = [...(formData.variations || [])];
      newVariations[index] = {
        ...newVariations[index],
        price: finalPrice,
        oldPrice: basePrice,
        promotionRuleId: Number(ruleId),
      };
      setFormData(prev => ({ ...prev, variations: newVariations }));
      toast.success(`Active: -${discountPercent}%`);
    }
  };

  const clearVariants = () => {
    setFormData(prev => ({ ...prev, variations: [] }));
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
        <div className="text-sm text-muted-foreground">
          Cliquez sur générer pour créer le tableau des stocks basé sur vos
          images et tailles.
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
            (Re)Générer les variantes
          </Button>
        </div>
      </div>

      {/* Variants Table */}
      {formData.variations && formData.variations.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/50 shadow-lg shadow-black/5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
          <Table>
            <TableHeader className="bg-black/5 dark:bg-white/5">
              <TableRow className="hover:bg-transparent border-black/5 dark:border-white/5">
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[180px]">
                  SKU (Réf)
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Détails
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[150px]">
                  Promo
                </TableHead>
                <TableHead className="font-semibold text-right text-xs uppercase tracking-wider text-muted-foreground w-[120px]">
                  Prix (Ar) *
                </TableHead>
                <TableHead className="font-semibold text-right text-xs uppercase tracking-wider text-muted-foreground w-[100px]">
                  Stock *
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.variations.map((variant, index) => (
                <TableRow
                  key={index}
                  className="group transition-colors hover:bg-primary/5 border-black/5 dark:border-white/5"
                >
                  <TableCell className="font-medium font-mono text-xs">
                    <div className="flex flex-col">
                      <span>{variant.sku}</span>
                      {variant.oldPrice && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          Base: {variant.oldPrice}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {variant.color && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            Coul:
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4"
                          >
                            {variant.color}
                          </Badge>
                        </div>
                      )}
                      {variant.size && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            Taille:
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4"
                          >
                            {variant.size}
                          </Badge>
                        </div>
                      )}
                      {!variant.color && !variant.size && (
                        <span className="text-xs text-muted-foreground italic">
                          Standard
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={variant.promotionRuleId?.toString() || "none"}
                      onValueChange={val => applyPromotionToVariant(index, val)}
                    >
                      <SelectTrigger className="h-8 text-xs w-full bg-transparent border-dashed hover:bg-accent hover:border-solid text-muted-foreground">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        {activeRules.map(rule => (
                          <SelectItem key={rule.id} value={rule.id.toString()}>
                            {rule.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      value={variant.price}
                      min="0"
                      onChange={e =>
                        updateVariant(index, "price", Number(e.target.value))
                      }
                      className="h-8 w-full text-right font-medium text-xs"
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={variant.stock}
                      min="0"
                      onChange={e =>
                        updateVariant(index, "stock", Number(e.target.value))
                      }
                      className={`h-8 w-full text-center font-medium text-xs ${
                        variant.stock > 0
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                      placeholder="0"
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
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-full mb-4 shadow-sm">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Aucune variante générée
          </h3>
          <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">
            Cliquez sur "Générer les variantes" pour créer le tableau de stock
            basé sur vos images.
          </p>
          <Button onClick={generateVariants} size="sm">
            Générer maintenant
          </Button>
        </div>
      )}
    </div>
  );
}
