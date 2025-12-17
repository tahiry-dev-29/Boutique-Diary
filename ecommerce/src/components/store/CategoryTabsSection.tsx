"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/cart-store";
import { ArrowUpRight } from "lucide-react";
import anime from "animejs";
import { useEffect, useRef } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  images: { url: string }[];
  category?: { name: string };
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
        targets: containerRef.current.querySelectorAll(".product-item"),
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(50),
        easing: "easeOutQuad",
        duration: 500,
      });
    }
  }, [activeTab]);

  if (categories.length === 0) return null;

  return (
    <section className="py-20 px-4 md:px-6 bg-white">
      <div className="max-w-[1400px] mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-lg">{subtitle}</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === cat
                  ? "bg-black text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {displayProducts.length > 0 ? (
            displayProducts.map(product => (
              <div key={product.id} className="product-item opacity-0 group">
                <Link
                  href={`/store/product/${product.id}`}
                  className="block relative aspect-[4/5] rounded-[32px] overflow-hidden bg-gray-50 mb-4 cursor-pointer"
                >
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-bold">
                      No Image
                    </div>
                  )}

                  {/* Overlay/Action */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>

                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                    <ArrowUpRight className="w-5 h-5 text-black" />
                  </div>
                </Link>

                <div className="px-2">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 group-hover:text-gray-600 transition-colors">
                    <Link href={`/store/product/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      {product.category?.name || activeTab}
                    </p>
                    <span className="font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-400">
              Aucun produit trouvé dans {activeTab}.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
