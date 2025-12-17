"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import anime from "animejs";

export default function MeherHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Animate text elements
    anime({
      targets: containerRef.current.querySelectorAll(".hero-animate"),
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: "easeOutQuad",
      duration: 800,
    });

    // Animate badge
    anime({
      targets: containerRef.current.querySelector(".hero-badge"),
      translateX: [20, 0],
      opacity: [0, 1],
      delay: 600,
      easing: "easeOutExpo",
      duration: 1000,
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className="pt-12 pb-16 px-4 md:px-6 bg-white overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto text-center md:text-left relative">
        {/* Review Floating Badge (Top Right of text area) */}
        <div className="hero-badge hidden md:flex absolute right-0 top-0 flex-col items-end opacity-0">
          <div className="flex -space-x-3 mb-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative"
              >
                {/* Placeholder for avatars */}
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
              +
            </div>
          </div>
          <div className="text-right">
            <span className="block font-bold text-sm">500+</span>
            <span className="text-xs text-gray-500">Clients Satisfaits</span>
          </div>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-gray-900 leading-[1.1] mb-8">
            <div className="hero-animate opacity-0">Accès à des produits</div>
            <div className="hero-animate opacity-0">
              <span className="font-bold">Écologiques</span> de haute qualité
            </div>{" "}
            <div className="hero-animate opacity-0 flex items-center flex-wrap gap-4">
              et à nos services
              <span className="inline-flex items-center align-middle">
                <ArrowRight className="w-8 h-8 md:w-12 md:h-12 text-gray-400 stroke-[1.5]" />
                <button className="ml-4 bg-[#1a1a2e] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-black transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Contactez-nous
                </button>
              </span>
            </div>
          </h1>
        </div>
      </div>
    </section>
  );
}
