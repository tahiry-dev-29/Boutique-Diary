"use client";

import Image from "next/image";
import { Heart, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/cart-store";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  oldPrice?: number | null;
  image?: string;
  category?: string;
  isNew?: boolean;
  isPromotion?: boolean;
  isBestSeller?: boolean;
  rating?: number | null;
  reviewCount?: number;
  imageColor?: string;
}

export default function ProductCard({
  id,
  title,
  price,
  oldPrice,
  image,
  category,
  isNew,
  isPromotion,
  isBestSeller,
  rating,
  reviewCount,
  imageColor,
}: ProductCardProps) {
  // Calculate discount percentage if both prices are available
  const discountPercentage =
    isPromotion && oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  return (
    <div className="group relative flex flex-col h-full">
      {/* Image Container */}
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-[24px] mb-4 transition-all duration-500",
          imageColor || "bg-[#F8F8F8]",
        )}
      >
        <Link href={`/store/product/${id}`} className="block w-full h-full">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
              Image
            </div>
          )}
        </Link>

        {/* Floating Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isNew && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black text-white rounded-full shadow-sm shadow-black/10">
              Nouveau
            </span>
          )}
          {isPromotion && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white rounded-full shadow-sm shadow-rose-500/10">
              {discountPercentage ? `-${discountPercentage}%` : "Offre"}
            </span>
          )}
          {isBestSeller && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950 rounded-full shadow-sm shadow-amber-400/10">
              Top Vente
            </span>
          )}
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            className="p-2.5 rounded-full bg-white/95 backdrop-blur-sm text-gray-700 hover:text-rose-500 transition-colors shadow-lg border border-black/5"
            aria-label="Ajouter aux favoris"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Quick Action */}
        <button
          className="absolute bottom-4 inset-x-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl overflow-hidden active:scale-95"
          onClick={e => {
            e.preventDefault();
            // TODO: Cart logic
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Ajouter au panier</span>
          </div>
        </button>
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 px-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          {category && (
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
              {category}
            </span>
          )}
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-bold text-gray-700">
                {rating}
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/store/product/${id}`}
          className="text-sm md:text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2 tracking-tight"
        >
          {title}
        </Link>

        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-black text-gray-900">
            {formatPrice(price)}
          </span>
          {isPromotion && oldPrice && (
            <span className="text-xs text-gray-400 line-through decoration-rose-400/50">
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
