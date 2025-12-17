"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  images: { url: string }[];
  rating?: number | null;
}

interface CollectionScrollProps {
  products?: Product[];
}

export default function CollectionScroll({
  products = [],
}: CollectionScrollProps) {
  // Fallback if no products passed
  const displayProducts = products.length > 0 ? products : [];

  // Helper to get random pastel color for background if no image
  const bgColors = [
    "bg-[#e5fcf4]",
    "bg-[#6ec1e4]",
    "bg-[#b8d2e8]",
    "bg-[#336699]",
  ];

  return (
    <section className="py-16 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <div className="inline-block bg-gray-100 rounded-full px-4 py-1 text-xs font-medium mb-4">
              Découvrir nos produits
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Collection des produits <br />
              les plus vendus de l'année
            </h2>
          </div>

          <div className="mt-6 md:mt-0 text-right">
            <p className="text-xs text-gray-500 max-w-xs ml-auto mb-4">
              Nous distribuons nos collections dans des magasins incroyables.
              Découvrez-en plus sur nous et nos boutiques préférées.
            </p>
            <button className="border border-gray-300 rounded-full px-6 py-2 text-xs font-bold hover:bg-black hover:text-white transition-colors">
              Acheter maintenant
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end relative">
          {/* Navigation Arrows */}
          <div className="absolute -top-20 right-0 hidden md:flex gap-2">
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {displayProducts.map((item, index) => (
            <Link
              href={`/store/product/${item.id}`}
              key={item.id}
              className={`flex flex-col gap-3 ${index === 1 ? "lg:-mt-12" : ""}`}
            >
              <div
                className={`relative rounded-[32px] overflow-hidden ${bgColors[index % bgColors.length]} ${index === 1 ? "h-[380px]" : "h-[280px]"} w-full group`}
              >
                {item.images[0] ? (
                  <Image
                    src={item.images[0].url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-black/20 font-bold text-xl">
                    Pas d'image
                  </div>
                )}

                {index === 3 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <ArrowUpRight className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-yellow-500">
                    <span>★</span>{" "}
                    <span className="text-gray-400">
                      ({item.rating || 4.5})
                    </span>
                  </div>
                </div>
                <span className="font-bold text-sm">${item.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
