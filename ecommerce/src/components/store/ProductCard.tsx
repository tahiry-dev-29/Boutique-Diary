"use client";

import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image?: string;
  category?: string;
  isNew?: boolean;
  imageColor?: string;
}

export default function ProductCard({
  id,
  title,
  price,
  image,
  category,
  isNew,
  imageColor,
}: ProductCardProps) {
  return (
    <div className="group relative">
      <div
        className={`relative aspect-square overflow-hidden rounded-3xl mb-4 ${imageColor || "bg-gray-100"}`}
      >
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
            Image
          </div>
        )}

        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 transition-colors opacity-0 group-hover:opacity-100 shadow-sm">
          <Heart className="w-4 h-4" />
        </button>

        {/* Add to Cart Button (Bottom Right) - as seen in "Cool with this" section */}
        <button className="absolute bottom-3 right-3 p-2 rounded-full bg-white text-black hover:bg-black hover:text-white transition-colors opacity-0 group-hover:opacity-100 shadow-sm border border-gray-100">
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {category && (
          <span className="text-[10px] md:text-xs font-bold uppercase text-gray-400 tracking-wide">
            {category}
          </span>
        )}
        <Link
          href={`/store/product/${id}`}
          className="font-bold text-gray-900 line-clamp-1 hover:underline text-lg"
        >
          {title}
        </Link>
        <div className="flex items-center gap-1 text-xs text-yellow-400 mb-1">
          <span>★★★★☆</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-bold text-gray-900 text-lg">
            ${price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
