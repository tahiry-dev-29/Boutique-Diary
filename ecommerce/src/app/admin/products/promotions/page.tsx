"use client";

import React, { useEffect, useState } from "react";
import { ProductNav } from "@/components/admin/ProductNav";
import { PageHeader } from "@/components/admin/PageHeader";
import { Product } from "@/types/admin";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Tag, FilterX } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { usePromotionRules } from "@/features/marketing/hooks/use-promotion-rules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PromotionsPage() {
  const { rules } = usePromotionRules();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRuleId, setSelectedRuleId] = useState<string>("all");

  useEffect(() => {
    async function fetchPromotedProducts() {
      setLoading(true);
      try {
        let url = "/api/products?isPromotion=true";
        if (selectedRuleId && selectedRuleId !== "all") {
          url += `&promotionRuleId=${selectedRuleId}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch promoted products", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPromotedProducts();
  }, [selectedRuleId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Produits en Promotion"
          description="Vue Galerie des produits bénéficiant d'une réduction active."
        />

        <div className="w-[300px]">
          <Select value={selectedRuleId} onValueChange={setSelectedRuleId}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par règle..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les promotions</SelectItem>
              {rules.map(rule => (
                <SelectItem key={rule.id} value={rule.id.toString()}>
                  {rule.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ProductNav />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed">
          <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Aucune promotion active
            {selectedRuleId !== "all" && " pour cette règle"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Utilisez le module Marketing pour appliquer des règles de promotion.
          </p>
          {selectedRuleId !== "all" && (
            <Button
              variant="outline"
              onClick={() => setSelectedRuleId("all")}
              className="mt-4"
            >
              <FilterX className="mr-2 h-4 w-4" />
              Effacer le filtre
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => {
            const promotedVariant = product.images?.find(
              (img: any) => img.isPromotion && typeof img !== "string",
            );

            const finalPrice =
              promotedVariant && (promotedVariant as any).price
                ? (promotedVariant as any).price
                : product.price;
            const finalOldPrice =
              promotedVariant && (promotedVariant as any).oldPrice
                ? (promotedVariant as any).oldPrice
                : product.oldPrice;
            const finalReference =
              promotedVariant && (promotedVariant as any).reference
                ? (promotedVariant as any).reference
                : product.reference;

            let mainImage = "/placeholder.png";
            if (promotedVariant) {
              mainImage =
                typeof promotedVariant === "string"
                  ? promotedVariant
                  : promotedVariant.url;
            } else if (product.images && product.images.length > 0) {
              mainImage =
                typeof product.images[0] === "string"
                  ? product.images[0]
                  : product.images[0].url;
            }

            const activePrice = finalOldPrice || finalPrice;
            const discount =
              activePrice > 0
                ? Math.round(((activePrice - finalPrice) / activePrice) * 100)
                : 0;
            return (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="block h-full"
              >
                <Card className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md h-full flex flex-col p-0">
                  {}
                  <div className="relative aspect-[1.8/1] w-full overflow-hidden bg-gray-100 dark:bg-gray-800/50">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {}
                    <Badge className="absolute top-2 left-2 bg-rose-500 text-white border-0 px-2 py-0.5 text-[10px] font-bold shadow-sm">
                      -{discount}%
                    </Badge>

                    {}
                    {product.promotionRule && (
                      <div className="absolute bottom-2 right-2">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm text-[10px] px-2 py-0.5 h-auto font-medium shadow-sm border-0"
                        >
                          {product.promotionRule.name}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 flex flex-col flex-1">
                    {}
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2 font-medium uppercase tracking-wider">
                      <span>{finalReference}</span>
                      {product.brand && (
                        <>
                          <span className="text-gray-300 dark:text-gray-700">
                            •
                          </span>
                          <span className="truncate">{product.brand}</span>
                        </>
                      )}
                    </div>

                    {}
                    <h3
                      className="font-bold text-sm md:text-base leading-tight text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-primary transition-colors"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {}
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800/50 flex items-end justify-between">
                      <div className="flex flex-col">
                        {finalOldPrice && (
                          <span className="text-[11px] text-gray-400 line-through">
                            {formatPrice(finalOldPrice)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                          {formatPrice(finalPrice)}
                        </span>
                      </div>

                      {}
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                        />
                        <span className="text-[10px] font-medium text-gray-500">
                          {product.stock > 0
                            ? `${product.stock} en stock`
                            : "Épuisé"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
