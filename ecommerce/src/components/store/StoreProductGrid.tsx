"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number | null;
  category?: { name: string } | null;
  rating?: number | null;
  reviewCount?: number;
  isNew?: boolean;
  isPromotion?: boolean;
  isBestSeller?: boolean;
  images: { url: string }[];
}

interface StoreProductGridProps {
  products?: Product[];
  showTitle?: boolean;
  showFooter?: boolean;
}

export default function StoreProductGrid({
  products = [],
  showTitle = true,
  showFooter = true,
}: StoreProductGridProps) {
  const categories = ["Shoes", "Clothing", "Accessories", "Jewellery"];

  // Use passed products or empty
  const displayProducts = products;

  // Helper to get random pastel color since we might not have it in DB mainly
  const colors = [
    "bg-[#f3f4f6]",
    "bg-[#f9fafb]",
    "bg-[#f3f4f6]",
    "bg-[#f9fafb]",
  ];

  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-white">
      <div className="max-w-[1400px] mx-auto">
        {showTitle && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
                Découvrez nos articles
              </h2>
              <p className="text-sm md:text-base text-gray-500 max-w-xl">
                Une sélection exclusive renouvelée chaque semaine avec le
                meilleur du design et de la durabilité.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  className="px-5 py-2 rounded-full border border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400 hover:border-black hover:text-black transition-all duration-300"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {displayProducts.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
            <p className="text-gray-400 font-medium italic">
              Aucun produit trouvé.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {displayProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                id={product.id.toString()}
                title={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                category={product.category?.name}
                image={product.images[0]?.url}
                isNew={product.isNew}
                isPromotion={product.isPromotion}
                isBestSeller={product.isBestSeller}
                rating={product.rating}
                reviewCount={product.reviewCount}
                imageColor={colors[index % colors.length]}
              />
            ))}
          </div>
        )}

        {showFooter && (
          <div className="mt-16 flex justify-center">
            <Link
              href="/produits"
              className="group flex items-center gap-2 bg-[#1a1a2e] text-white px-10 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] hover:bg-black transition-all hover:scale-105 shadow-xl hover:shadow-[#1a1a2e]/20"
            >
              Voir toute la collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
