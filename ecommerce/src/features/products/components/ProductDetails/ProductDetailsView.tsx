"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COLOR_MAP } from "@/lib/constants";
import { formatPrice } from "@/lib/formatPrice";
import { DollarSign, Edit, Package, Share2, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ReviewListAdmin } from "./ReviewListAdmin";

interface ProductImage {
  id: number;
  url: string;
  reference?: string | null;
  color?: string | null;
  sizes: string[];
  price?: number | null;
  oldPrice?: number | null;
  stock?: number | null;
  isNew: boolean;
  isPromotion: boolean;
  categoryId?: number | null;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  oldPrice?: number | null;
  stock: number;
  brand: string | null;
  reference: string;
  rating: number;
  reviewCount: number;
  images: ProductImage[];
  category?: { id: number; name: string } | null;
  colors: string[];
  sizes: string[];
  isNew: boolean;
  isPromotion: boolean;
  isBestSeller: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductDetailsViewProps {
  product: Product;
}

export function ProductDetailsView({ product }: ProductDetailsViewProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [autoSelectedRef, setAutoSelectedRef] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const targetRef = params.get("reference");

    if (
      targetRef &&
      product.images &&
      product.images.length > 0 &&
      targetRef !== autoSelectedRef
    ) {
      const index = product.images.findIndex(
        img => img.reference === targetRef,
      );
      if (index !== -1) {
        setSelectedImageIndex(index);
        setAutoSelectedRef(targetRef);
        console.log(
          `[ProductDetailsView] Auto-selected image index ${index} for reference ${targetRef}`,
        );
      }
    }
  }, [product.images, autoSelectedRef]);

  const currentImage = product.images[selectedImageIndex];

  const displayPrice = currentImage?.price ?? product.price;
  const displayOldPrice = currentImage?.oldPrice ?? product.oldPrice;
  const displayStock = currentImage?.stock ?? product.stock;
  const displayRef = currentImage?.reference ?? product.reference;

  const stats = [
    {
      label: "Prix Actuel",
      value: formatPrice(displayPrice),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Stock Disponible",
      value: displayStock,
      icon: Package,
      color: displayStock > 0 ? "text-blue-600" : "text-red-600",
      bg: displayStock > 0 ? "bg-blue-50" : "bg-red-50",
    },
    {
      label: "Note Moyenne",
      value: `${product.rating}/5`,
      sub: `(${product.reviewCount} avis)`,
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  const handleEdit = () => {
    router.push(`/admin/products/${product.id}/edit`);
  };

  const hasDiscount = displayOldPrice && displayOldPrice > displayPrice;
  const discountPercent = hasDiscount
    ? Math.round(((displayOldPrice! - displayPrice) / displayOldPrice!) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {}
      <PageHeader
        title={product.name}
        description={`Réf: ${displayRef} • Publié le: ${new Date(product.createdAt).toLocaleDateString()}`}
        className="mb-4"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast.info("Lien copié !")}>
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
          <Button
            onClick={handleEdit}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </PageHeader>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-1 space-y-4">
          <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative group">
            <img
              src={currentImage?.url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isNew && <Badge className="bg-blue-600">Nouveau</Badge>}
              {product.isPromotion && (
                <Badge className="bg-red-600">Promo</Badge>
              )}
              {product.isBestSeller && (
                <Badge className="bg-amber-500">Best-seller</Badge>
              )}
            </div>
          </div>

          {}
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((img, idx) => (
              <div
                key={img.id || idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  idx === selectedImageIndex
                    ? "border-black ring-1 ring-black/20"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img
                  src={img.url}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Columns: Stats & Info */}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card
                key={i}
                className="border-none shadow-sm bg-gray-100 dark:bg-gray-800"
              >
                <CardContent className="p-4 flex flex-col gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.bg}`}
                  >
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      {stat.sub && (
                        <span className="text-xs text-gray-500">
                          {stat.sub}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Tabs defaultValue="details" className="w-full">
              <div className="border-b border-gray-100 dark:border-gray-700 flex justify-between p-4">
                <TabsList className="bg-transparent p-0 gap-6 w-full flex items-center justify-center">
                  <TabsTrigger
                    value="details"
                    className="rounded-2xl px-2 pb-2 font-semibold text-gray-500 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all"
                  >
                    Détails
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-2xl px-2 pb-2 font-medium text-gray-500 dark:text-gray-400 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all"
                  >
                    Avis Clients
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="details"
                className="p-6 space-y-8 animate-in slide-in-from-bottom-2 duration-300"
              >
                {}
                <div>
                  <h3 className="text-base font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {product.description ||
                      "Aucune description disponible pour ce produit."}
                  </p>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">
                      Couleurs Disponibles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map(color => {
                        const isActive = currentImage?.color === color;
                        return (
                          <div
                            key={color}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isActive ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700" : "border-gray-200 dark:border-gray-700"}`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-gray-200"
                              style={{ background: COLOR_MAP[color] || "gray" }}
                            />
                            <span className="text-sm font-medium">{color}</span>
                          </div>
                        );
                      })}
                      {product.colors.length === 0 && (
                        <span className="text-sm text-gray-400 italic">
                          Aucune variante couleur
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">
                      Tailles Disponibles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => {
                        const isActive = currentImage?.sizes?.includes(size);
                        return (
                          <Badge
                            key={size}
                            variant="outline"
                            className={`px-4 py-1.5 text-sm ${isActive ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700 font-bold" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            {size}
                          </Badge>
                        );
                      })}
                      {product.sizes.length === 0 && (
                        <span className="text-sm text-gray-400 italic">
                          Taille unique ou non spécifié
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <div>
                  <h3 className="text-base font-semibold mb-2">
                    Spécifications
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                      <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Catégorie
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {product.category?.name || "N/A"}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Marque
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {product.brand || "N/A"}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Poids
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          -- Gr
                        </p>{" "}
                        {}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          SKU / Ref
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {displayRef}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-6">
                <ReviewListAdmin productId={product.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
