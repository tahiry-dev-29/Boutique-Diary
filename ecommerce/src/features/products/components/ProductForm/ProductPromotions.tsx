"use client";

import { usePromotionRules } from "@/features/marketing/hooks/use-promotion-rules";
import { Product } from "@/types/admin";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Tag, Percent, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProductPromotionsProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
}

export function ProductPromotions({
  formData,
  setFormData,
}: ProductPromotionsProps) {
  const { rules, loading } = usePromotionRules();
  
  const activeRules = rules.filter(r => r.isActive);

  const handleRuleChange = (ruleId: string) => {
    const id = parseInt(ruleId);
    setFormData(prev => ({
      ...prev,
      promotionRuleId: id,
      isPromotion: true, 
    }));
  };

  const clearSelection = () => {
    setFormData(prev => ({
      ...prev,
      promotionRuleId: null,
      isPromotion: false,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Promotions Disponibles</h3>
          <p className="text-sm text-muted-foreground">
            Sélectionnez une règle de marketing active à appliquer à ce produit.
          </p>
        </div>
        {(formData.promotionRuleId || formData.isPromotion) && (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-destructive hover:text-white transition-colors"
            onClick={clearSelection}
          >
            Désactiver la promotion
          </Badge>
        )}
      </div>

      {activeRules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <Tag className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium text-muted-foreground">
            Aucune promotion active
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Créez des campagnes dans la section Marketing.
          </p>
        </div>
      ) : (
        <RadioGroup
          value={formData.promotionRuleId?.toString() || ""}
          onValueChange={handleRuleChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {activeRules.map(rule => {
            const actions =
              typeof rule.actions === "string"
                ? JSON.parse(rule.actions)
                : rule.actions;
            const discount =
              actions.discountPercentage || actions.percentage || 0;

            return (
              <Label
                key={rule.id}
                htmlFor={`rule-${rule.id}`}
                className={cn(
                  "cursor-pointer border-2 rounded-xl p-4 transition-all hover:bg-accent hover:border-primary/50 relative overflow-hidden group",
                  formData.promotionRuleId === rule.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card",
                )}
              >
                <RadioGroupItem
                  value={rule.id.toString()}
                  id={`rule-${rule.id}`}
                  className="sr-only"
                />

                <div className="flex justify-between items-start mb-2">
                  <Badge
                    className={cn(
                      "font-bold",
                      formData.promotionRuleId === rule.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {rule.name}
                  </Badge>
                  {discount > 0 && (
                    <span className="flex items-center text-green-600 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs">
                      <Percent className="w-3 h-3 mr-1" /> -{discount}%
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs">
                      {rule.startDate
                        ? format(new Date(rule.startDate), "dd MMM", {
                            locale: fr,
                          })
                        : "Maintenant"}
                      {" -> "}
                      {rule.endDate
                        ? format(new Date(rule.endDate), "dd MMM yyyy", {
                            locale: fr,
                          })
                        : "Indéfini"}
                    </span>
                  </div>
                </div>

                {}
                {formData.promotionRuleId === rule.id && (
                  <div className="absolute top-0 right-0 p-1 bg-primary text-white rounded-bl-lg shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-white ml-0.5 mt-0.5" />
                  </div>
                )}
              </Label>
            );
          })}
        </RadioGroup>
      )}
    </div>
  );
}
