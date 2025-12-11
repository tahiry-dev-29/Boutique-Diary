"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@/types/banner";

const defaultBanner = {
  id: 0,
  title: "CUSTOMIZED",
  subtitle: "FASHION",
  description:
    "Our curated collection showcases handpicked garments and accessories from both renowned designers and emerging talents worldwide.",
  buttonText: "READ MORE",
  buttonLink: "/shop",
  imageUrl: "/hero-model.png",
  order: 1,
  isActive: true,
};

export default function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners");
        if (response.ok) {
          const data = await response.json();
          const activeBanners = data.filter((b: Banner) => b.isActive);
          setBanners(activeBanners);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des bannières:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const goToNext = useCallback(() => {
    const totalBanners = banners.length || 1;
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
  }, [banners.length]);

  const goToPrev = useCallback(() => {
    const totalBanners = banners.length || 1;
    setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [banners.length, goToNext]);

  const currentBanner =
    banners.length > 0 ? banners[currentIndex] : defaultBanner;

  if (isLoading) {
    return (
      <section className="hero-wrapper">
        <div className="hero-loading">
          <div className="hero-spinner"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-wrapper">
      {}
      <div className="hero-bg-circle hero-bg-circle-1"></div>
      <div className="hero-bg-circle hero-bg-circle-2"></div>

      <div className="hero-main">
        {}
        <div className="hero-left">
          <h1 className="hero-heading">
            <span className="hero-heading-gradient">{currentBanner.title}</span>
            {currentBanner.subtitle && (
              <span className="hero-heading-accent">
                {currentBanner.subtitle}
              </span>
            )}
          </h1>

          {currentBanner.description && (
            <p className="hero-text">{currentBanner.description}</p>
          )}

          {currentBanner.buttonText && currentBanner.buttonLink && (
            <Link href={currentBanner.buttonLink} className="hero-btn">
              {currentBanner.buttonText}
            </Link>
          )}
        </div>

        {}
        <div className="hero-right">
          {}
          <div className="hero-arch-border"></div>

          {}
          <div className="hero-arch-container">
            <Image
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              width={450}
              height={550}
              className="hero-arch-image"
              priority
            />
          </div>

          {}
          <div className="hero-dot hero-dot-top"></div>
          <div className="hero-blob hero-blob-top-right"></div>
          <div className="hero-dot hero-dot-bottom-right"></div>
          <div className="hero-blob hero-blob-bottom-left"></div>

          {}
          {banners.length > 1 && (
            <div className="hero-nav">
              <button
                onClick={goToPrev}
                className="hero-nav-btn hero-nav-btn-prev"
                aria-label="Previous"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="hero-nav-btn hero-nav-btn-next"
                aria-label="Next"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
