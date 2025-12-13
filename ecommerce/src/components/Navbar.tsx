"use client";

import PromoBanner from "./navbar/PromoBanner";
import MainHeader from "./navbar/MainHeader";
import CategoryNav from "./navbar/CategoryNav";

export default function Navbar() {
  return (
    <header className="w-full font-sans relative">
      {}
      <PromoBanner />

      {}
      <div className="sticky top-0 z-50 bg-gray-100 shadow-sm">
        <MainHeader />
        <CategoryNav />
      </div>
    </header>
  );
}
