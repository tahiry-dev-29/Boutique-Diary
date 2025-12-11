"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/formatPrice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Star,
  Share2,
} from "lucide-react";
import { COLOR_MAP } from "@/lib/constants";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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

  // Derive current image object
  const currentImage = product.images[selectedImageIndex];

  // Logic to determine display values (Image-specific OR Product-level fallback)
  const displayPrice = currentImage?.price ?? product.price;
  const displayOldPrice = currentImage?.oldPrice ?? product.oldPrice;
  const displayStock = currentImage?.stock ?? product.stock;
  const displayRef = currentImage?.reference ?? product.reference;

  // Calculate stats (Mocking explicit generic stats not in DB)
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
    {
        label: "Ventes Totales",
        value: "250", // MOCK: pending real order data
        icon: TrendingUp,
        color: "text-purple-600",
        bg: "bg-purple-50"
    }
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
             <Button variant="ghost" size="sm" className="h-6 px-0 hover:bg-transparent" onClick={() => router.push('/admin/products')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour
             </Button>
             <span>/</span>
             <span className="font-medium text-gray-900">{product.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
             <span>Réf: <span className="font-mono text-gray-900">{displayRef}</span></span>
             <span>•</span>
             <span>Publié le: {new Date(product.createdAt).toLocaleDateString()}</span>
             {product.brand && (
                 <>
                    <span>•</span>
                    <span>Marque: <span className="font-medium text-gray-900">{product.brand}</span></span>
                 </>
             )}
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={() => toast.info("Link copied!")}>
              <Share2 className="w-4 h-4 mr-2" />
              Partager
           </Button>
           <Button onClick={handleEdit} className="bg-black hover:bg-gray-800 text-white">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
           </Button>
           <Button variant="destructive" size="icon">
              <Trash2 className="w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-1 space-y-4">
            <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group">
                <img
                    src={currentImage?.url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNew && <Badge className="bg-blue-600">Nouveau</Badge>}
                    {product.isPromotion && <Badge className="bg-red-600">Promo</Badge>}
                    {product.isBestSeller && <Badge className="bg-amber-500">Best-seller</Badge>}
                </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-5 gap-2">
                {product.images.map((img, idx) => (
                    <div
                        key={img.id || idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                            idx === selectedImageIndex ? "border-black ring-1 ring-black/20" : "border-transparent hover:border-gray-300"
                        }`}
                    >
                         <img src={img.url} className="w-full h-full object-cover" alt="" />
                    </div>
                ))}
            </div>
        </div>

        {/* Right Columns: Stats & Info */}
        <div className="lg:col-span-2 space-y-8">
           {/* Stats Cards */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {stats.map((stat, i) => (
                   <Card key={i} className="border-none shadow-sm bg-white">
                       <CardContent className="p-4 flex flex-col gap-2">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.bg}`}>
                               <stat.icon className={`w-4 h-4 ${stat.color}`} />
                           </div>
                           <div>
                               <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                               <div className="flex items-baseline gap-1">
                                   <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                   {stat.sub && <span className="text-xs text-gray-500">{stat.sub}</span>}
                               </div>
                           </div>
                       </CardContent>
                   </Card>
               ))}
           </div>

           {/* Tabbed Content */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <Tabs defaultValue="details" className="w-full">
                   <div className="px-6 pt-6 border-b border-gray-100">
                    <TabsList className="bg-transparent p-0 gap-6">
                        <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-0 pb-2 font-medium text-gray-500 data-[state=active]:text-black transition-all">Détails</TabsTrigger>
                        <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-0 pb-2 font-medium text-gray-500 data-[state=active]:text-black transition-all">Avis Clients</TabsTrigger>
                    </TabsList>
                   </div>

                   <TabsContent value="details" className="p-6 space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {product.description || "Aucune description disponible pour ce produit."}
                            </p>
                        </div>

                        {/* Variants Selection visualization */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                 <h3 className="text-sm font-semibold mb-3">Couleurs Disponibles</h3>
                                 <div className="flex flex-wrap gap-2">
                                     {product.colors.map(color => {
                                         const isActive = currentImage?.color === color;
                                         return (
                                            <div key={color} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isActive ? "border-black bg-gray-50" : "border-gray-200"}`}>
                                                 <span className="w-3 h-3 rounded-full border border-gray-200" style={{ background: COLOR_MAP[color] || 'gray' }} />
                                                 <span className="text-sm font-medium">{color}</span>
                                            </div>
                                         )
                                     })}
                                     {product.colors.length === 0 && <span className="text-sm text-gray-400 italic">Aucune variante couleur</span>}
                                 </div>
                             </div>
                             <div>
                                 <h3 className="text-sm font-semibold mb-3">Tailles Disponibles</h3>
                                 <div className="flex flex-wrap gap-2">
                                     {product.sizes.map(size => {
                                         const isActive = currentImage?.sizes?.includes(size);
                                         return (
                                              <Badge key={size} variant="outline" className={`px-4 py-1.5 text-sm ${isActive ? "border-black bg-gray-50 font-bold" : "text-gray-500"}`}>
                                                  {size}
                                              </Badge>
                                         )
                                     })}
                                     {product.sizes.length === 0 && <span className="text-sm text-gray-400 italic">Taille unique ou non spécifié</span>}
                                 </div>
                             </div>
                        </div>

                        {/* Spec Table */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Spécifications</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-gray-100 bg-gray-50/50">
                                   <div className="p-4">
                                       <p className="text-xs text-gray-500 uppercase font-semibold">Catégorie</p>
                                       <p className="text-sm font-medium text-gray-900 mt-1">{product.category?.name || "N/A"}</p>
                                   </div>
                                   <div className="p-4">
                                       <p className="text-xs text-gray-500 uppercase font-semibold">Marque</p>
                                       <p className="text-sm font-medium text-gray-900 mt-1">{product.brand || "N/A"}</p>
                                   </div>
                                    <div className="p-4">
                                       <p className="text-xs text-gray-500 uppercase font-semibold">Poids</p>
                                       <p className="text-sm font-medium text-gray-900 mt-1">-- Gr</p> {/* Mocked for now */}
                                   </div>
                                    <div className="p-4">
                                       <p className="text-xs text-gray-500 uppercase font-semibold">SKU / Ref</p>
                                       <p className="text-sm font-medium text-gray-900 mt-1">{product.reference}</p>
                                   </div>
                                </div>
                            </div>
                        </div>
                   </TabsContent>

                   <TabsContent value="reviews" className="p-6">
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                             <div className="bg-gray-100 p-4 rounded-full">
                                <Star className="w-8 h-8 text-gray-400" />
                             </div>
                             <h3 className="text-lg font-medium text-gray-900">Aucun avis pour le moment</h3>
                             <p className="text-gray-500 max-w-sm">Les avis clients s&apos;afficheront ici une fois que vos clients commenceront à noter ce produit.</p>
                             <Button variant="outline">Simuler un avis</Button>
                        </div>
                   </TabsContent>
               </Tabs>
           </div>
        </div>
      </div>
    </div>
  );
}
