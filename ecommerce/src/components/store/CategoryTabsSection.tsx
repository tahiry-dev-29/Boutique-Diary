"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/cart-store";
import { ArrowUpRight } from "lucide-react";
import anime from "animejs";
import { useEffect, useRef } from "react";

import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number | null;
  images: { url: string }[];
  category?: { name: string };
  isNew?: boolean;
  isPromotion?: boolean;
  isBestSeller?: boolean;
  rating?: number | null;
  reviewCount?: number;
}

interface CategoryTabsSectionProps {
  productsMap: Record<string, Product[]>;
  title?: string;
  subtitle?: string;
}

export default function CategoryTabsSection({
  productsMap,
  title = "Tous nos produits",
  subtitle = "Ces produits peuvent varier chaque semaine ou selon les saisons pour toujours plus de nouveauté.",
}: CategoryTabsSectionProps) {
  const categories = Object.keys(productsMap);
  const [activeTab, setActiveTab] = useState(categories[0] || "");
  const containerRef = useRef<HTMLDivElement>(null);

  const displayProducts = productsMap[activeTab] || [];

  // Animation when tab changes
  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll(".product-item-wrapper"),
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(50),
        easing: "easeOutQuad",
        duration: 500,
      });
    }
  }, [activeTab]);

  if (categories.length === 0) return null;

  const bgColors = ["bg-[#f3f4f6]", "bg-[#f9fafb]"];

  return (
    <section className="py-20 px-4 md:px-6 bg-white">
      <div className="max-w-[1400px] mx-auto">
        {}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-gray-900 uppercase">
            {title}
          </h2>
          <div className="w-20 h-1.5 bg-black mx-auto mb-6"></div>
          <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>

        {}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-10 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                activeTab === cat
                  ? "bg-black text-white shadow-2xl shadow-black/20 scale-105"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {}
        <div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
        >
          {displayProducts.length > 0 ? (
            displayProducts.map((product, index) => (
              <div key={product.id} className="product-item-wrapper opacity-0">
                <ProductCard
                  id={product.id.toString()}
                  title={product.name}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  category={product.category?.name || activeTab}
                  image={product.images[0]?.url}
                  isNew={product.isNew}
                  isPromotion={product.isPromotion}
                  isBestSeller={product.isBestSeller}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  imageColor={bgColors[index % bgColors.length]}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-400 font-medium italic">
              Aucun produit trouvé dans {activeTab}.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
