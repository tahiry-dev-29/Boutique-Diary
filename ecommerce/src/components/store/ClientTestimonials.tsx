"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ClientTestimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Jean Dupont",
      date: "02 Février",
      rating: 4,
      title: "Une expérience au top",
      review:
        "J'ai récemment visité ce barbier, et je dois dire que c'était une expérience classique... Il a pris le temps de comprendre exactement ce que je voulais.",
    },
    {
      id: 2,
      name: "Marie Martin",
      date: "06 Février",
      rating: 4,
      title: "Super Produit",
      review:
        "J'utilise ce produit quotidiennement depuis un mois, et il fonctionne parfaitement sans aucun problème. Il est assez puissant pour tout faire.",
    },
  ];

  return (
    <section className="py-16 px-4 md:px-6 mb-16">
      <div className="max-w-[1400px] mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Nos clients satisfaits</h2>

        <div className="flex items-center justify-center gap-6">
          <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 shadow-sm text-gray-400 hover:text-black">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {testimonials.map(item => (
              <div
                key={item.id}
                className="min-w-[300px] md:w-[500px] bg-white border border-gray-100 p-8 rounded-[24px] text-left shadow-sm snap-center"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      {/* Avatar Placeholder */}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  "{item.review}"
                </p>
              </div>
            ))}
          </div>

          <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 shadow-sm text-gray-400 hover:text-black">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
