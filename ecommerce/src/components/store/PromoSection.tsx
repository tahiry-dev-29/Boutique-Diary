"use client";

import { Heart, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import anime from "animejs";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/cart-store";

interface PromoSectionProps {
  products?: any[];
}

export default function PromoSection({ products = [] }: PromoSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const bgColors = ["bg-[#e8e458]", "bg-[#f2f0ea]", "bg-[#fcb334]"];
  const rotations = ["rotate-[-5deg]", "rotate-[0deg]", "rotate-[10deg]"];

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            anime({
              targets: entry.target.querySelectorAll(".promo-card"),
              translateY: [50, 0],
              opacity: [0, 1],
              delay: anime.stagger(150),
              easing: "spring(1, 80, 10, 0)",
              duration: 1000,
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const displayProducts = products.slice(0, 3);

  if (displayProducts.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-8 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayProducts.map((product, index) => {
          // Basic logic to pick a color/rotation based on index
          const bgColor = bgColors[index % bgColors.length];
          const rotation = rotations[index % rotations.length];
          const imageUrl = product.images?.[0]?.url;

          return (
            <div
              key={product.id}
              className={`promo-card opacity-0 translate-y-10 relative h-[300px] rounded-[32px] overflow-hidden ${bgColor} group transition-all duration-300 hover:shadow-xl`}
            >
              <button
                className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10 hover:scale-110 transition-transform shadow-sm"
                title="Ajouter aux favoris"
              >
                <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
              </button>

              <Link
                href={`/store/product/${product.id}`}
                className="absolute top-4 right-4 bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-black z-10 hover:bg-white transition-colors flex items-center gap-1"
              >
                Acheter <ArrowRight className="w-3 h-3" />
              </Link>

              <Link
                href={`/store/product/${product.id}`}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
              >
                {imageUrl ? (
                  <div
                    className={`relative w-4/5 h-4/5 transition-transform duration-500 group-hover:scale-105 ${rotation} group-hover:rotate-0`}
                  >
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-2/3 h-2/3 bg-black/5 rounded-2xl ${rotation} flex items-center justify-center`}
                  >
                    <span className="text-black/20 font-bold text-xl uppercase">
                      No Image
                    </span>
                  </div>
                )}
              </Link>

              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm px-5 py-4 rounded-2xl shadow-sm z-20 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm truncate max-w-[150px]">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {product.category?.name || "Produit"}
                  </p>
                </div>
                <div className="font-bold text-sm">
                  {formatPrice(product.price)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/promotions"
          className="group flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-all hover:gap-4 shadow-lg hover:shadow-black/20"
        >
          Voir plus d'offres
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
