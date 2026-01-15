"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import anime from "animejs";
import { HeroConfig } from "@/lib/theme/theme-config";
import { cn } from "@/lib/utils";

interface DiaryHeroProps {
  customerCount?: number;
  recentCustomers?: {
    id: string | number;
    username: string;
    photo?: string | null;
  }[];
  heroConfig?: HeroConfig;
  previewMode?: boolean;
}

export default function DiaryHero({
  customerCount = 0,
  recentCustomers = [],
  heroConfig,
  previewMode = false,
}: DiaryHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use heroConfig values or defaults
  const title =
    heroConfig?.title ||
    "Accès à des produits Écologiques de haute qualité et à nos services";
  const subtitle = heroConfig?.subtitle || "";
  const ctaText = heroConfig?.ctaText || "Contactez-nous";
  const ctaLink = heroConfig?.ctaLink || "/contact";
  const bgImage = heroConfig?.bgImage || "";
  const overlay = heroConfig?.overlay || false;
  const overlayOpacity = heroConfig?.overlayOpacity || 0.5;

  const displayCount = customerCount;
  const displayAvatars =
    recentCustomers.length > 0
      ? recentCustomers.map((c) => ({
          url: c.photo || `https://i.pravatar.cc/150?u=${c.id}`,
          name: c.username,
        }))
      : [
          { url: "https://i.pravatar.cc/150?u=1", name: "Client" },
          { url: "https://i.pravatar.cc/150?u=2", name: "Client" },
          { url: "https://i.pravatar.cc/150?u=3", name: "Client" },
        ];

  useEffect(() => {
    // Skip animations in preview mode
    if (previewMode || !containerRef.current) return;

    anime({
      targets: containerRef.current.querySelectorAll(".hero-animate"),
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: "easeOutQuad",
      duration: 800,
    });

    anime({
      targets: containerRef.current.querySelector(".hero-badge"),
      translateX: [20, 0],
      opacity: [0, 1],
      delay: 600,
      easing: "easeOutExpo",
      duration: 1000,
    });
  }, [previewMode]);

  // Parse title into lines for display
  const titleLines = title.split("\n").filter(Boolean);
  const firstLine = titleLines[0] || "Accès à des produits";
  const secondLine = titleLines[1] || "Écologiques de haute qualité";

  return (
    <section
      ref={containerRef}
      className="pt-12 pb-16 px-4 md:px-6 overflow-hidden relative"
      style={{
        backgroundColor: bgImage ? "transparent" : "var(--background, #ffffff)",
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      {bgImage && overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div className="max-w-[1400px] mx-auto text-center md:text-left relative">
        {}
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
            <div className="w-10 h-10 rounded-full border-2 border-white bg-background flex items-center justify-center text-xs font-bold text-gray-400 shadow-sm leading-none">
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

        <div className="max-w-4xl relative z-10">
          <h1
            className={cn(
              "text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-8",
              bgImage && overlay ? "text-white" : "text-gray-900",
            )}
          >
            <div
              className={cn(
                "hero-animate",
                previewMode ? "opacity-100" : "opacity-0",
              )}
            >
              {firstLine}
            </div>
            <div
              className={cn(
                "hero-animate",
                previewMode ? "opacity-100" : "opacity-0",
              )}
            >
              <span className="font-bold">{secondLine}</span>
            </div>
            {subtitle && (
              <p
                className={cn(
                  "text-lg font-normal mt-4",
                  bgImage && overlay ? "text-white/80" : "text-gray-500",
                )}
              >
                {subtitle}
              </p>
            )}
            <div
              className={cn(
                "hero-animate flex items-center flex-wrap gap-4 mt-6",
                previewMode ? "opacity-100" : "opacity-0",
              )}
            >
              <span className="inline-flex items-center align-middle">
                <ArrowRight
                  className={cn(
                    "w-8 h-8 md:w-12 md:h-12 stroke-[1.5]",
                    bgImage && overlay ? "text-white/60" : "text-gray-400",
                  )}
                />
                <a
                  href={ctaLink}
                  className="ml-4 bg-[#1a1a2e] text-white px-8 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  style={{ backgroundColor: "var(--store-primary)" }}
                >
                  {ctaText}
                </a>
              </span>
            </div>
          </h1>
        </div>
      </div>
    </section>
  );
}
