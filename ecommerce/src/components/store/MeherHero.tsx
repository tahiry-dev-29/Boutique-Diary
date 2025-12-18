"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import anime from "animejs";

export default function MeherHero({
  customerCount = 0,
  recentCustomers = [],
}: {
  customerCount?: number;
  recentCustomers?: any[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const displayCount = customerCount;
  const displayAvatars =
    recentCustomers.length > 0
      ? recentCustomers.map(c => ({
          url: `https://i.pravatar.cc/150?u=${c.id}`,
          name: c.username,
        }))
      : [
          { url: "https://i.pravatar.cc/150?u=1", name: "Client" },
          { url: "https://i.pravatar.cc/150?u=2", name: "Client" },
          { url: "https://i.pravatar.cc/150?u=3", name: "Client" },
        ];

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
            {displayAvatars.map((client, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative shadow-sm"
              >
                <Image
                  src={client.url}
                  alt={client.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center text-xs font-bold text-gray-400 shadow-sm leading-none">
              +
            </div>
          </div>
          <div className="text-right">
            <span className="block font-bold text-sm leading-none">
              {displayCount}+
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              Clients Satisfaits
            </span>
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
