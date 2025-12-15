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
            // Check for promoted variant (Image level promotion)
            const promotedVariant = product.images?.find(
              (img: any) => img.isPromotion && typeof img !== "string",
            );

            // Determine data source (Variant vs Main Product)
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

            // Image Source
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
              <Card
                key={product.id}
                className="overflow-hidden rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 group"
              >
                <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-800/50 p-6 flex items-center justify-center">
                  <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-contain" // Changed to contain to respect padding
                    />
                  </div>

                  {/* Discount Badge */}
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 px-2 py-1 text-xs font-bold rounded-full">
                    -{discount}%
                  </Badge>

                  {/* Rule Badge */}
                  {product.promotionRule && (
                    <Badge className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 text-gray-800 dark:text-gray-200 border-0 text-[10px] px-2 py-1 shadow-sm rounded-full backdrop-blur-sm">
                      {product.promotionRule.name}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Title & Reference */}
                  <div className="mb-3">
                    <h3
                      className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span>{finalReference}</span>
                      {product.brand && (
                        <>
                          <span>•</span>
                          <span>{product.brand}</span>
                        </>
                      )}
                      {product.category && (
                        <>
                          <span>•</span>
                          <span>{product.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rating (Placeholder based on design) */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4].map(star => (
                      <div
                        key={star}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-yellow-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ))}
                    <span className="text-xs text-gray-500 font-medium ml-1">
                      (4.5)
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    {product.stock > 0 ? (
                      <span className="text-green-600 font-bold text-sm">
                        En Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold text-sm">
                        Épuisé
                      </span>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(finalPrice)}
                      </span>
                      {finalOldPrice && (
                        <span className="text-sm text-gray-400 line-through font-medium">
                          {formatPrice(finalOldPrice)}
                        </span>
                      )}
                    </div>

                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button
                        size="icon"
                        className="h-12 w-12 rounded-full bg-[#84D52C] hover:bg-[#72be24] text-white shadow-lg shadow-green-200 dark:shadow-none transition-transform hover:scale-105"
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
