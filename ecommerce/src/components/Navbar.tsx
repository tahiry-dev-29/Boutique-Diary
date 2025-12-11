"use client";

import PromoBanner from "./navbar/PromoBanner";
import MainHeader from "./navbar/MainHeader";
import CategoryNav from "./navbar/CategoryNav";

export default function Navbar() {
  return (
    <header className="w-full font-sans relative">
      {/* 1. Promo Banner - Disappears on scroll */}
      <PromoBanner />

      {/* 2. Main Header + Nav - Sticky */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <MainHeader />
        <CategoryNav />
      </div>
    </header>
  );
}
