"use client";

import React from "react";
import Link from "next/link";
import { Search, User, ShoppingCart, Heart, Headset, Menu } from "lucide-react";
import CategorySidebar from "./CategorySidebar";

const MainHeader = () => {
  return (
    <div className="py-4 px-4 md:px-8 border-b border-gray-100 bg-white">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 relative">
        {/* Left: Logo & Catalog Button */}
        <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-start">
          <Link href="/" className="flex-shrink-0">
            {/* Using a placeholder for Greenweez style logo if actual image not available, 
                 but trying to match text style if no image */}
            <div className="flex flex-col leading-none">
              <span className="text-[#104f32] font-bold text-2xl tracking-tighter">
                GREEN
              </span>
              <span className="text-[#104f32] font-bold text-2xl tracking-tighter flex items-center">
                WEEZ
                <span className="w-2 h-2 bg-yellow-400 rounded-full ml-0.5"></span>
              </span>
            </div>
          </Link>

          <CategorySidebar />
        </div>

        {/* Center: Search Bar & Badges */}
        <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4">
          {/* Badges - Hidden on small mobile to save space if needed, or kept */}
          <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
            <Link
              href="/shop?promo=true"
              className="px-3 py-1 bg-[#fce7f3] text-[#db2777] rounded-full text-sm font-bold hover:bg-[#fbcfe8] transition-colors"
            >
              Promos
            </Link>
            <Link
              href="/shop"
              className="px-3 py-1 bg-[#fef9c3] text-[#ca8a04] rounded-full text-sm font-bold hover:bg-[#fef08a] transition-colors"
            >
              Boutiques
            </Link>
          </div>

          {/* Search Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Rechercher un produit, une marque, une catégorie..."
              className="w-full bg-gray-100/80 border-none rounded-r-full rounded-l-full py-3 pl-12 pr-4 text-gray-700 focus:ring-2 focus:ring-[#104f32] focus:bg-white transition-all outline-none"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6 lg:gap-8 flex-shrink-0 w-full lg:w-auto justify-around lg:justify-end">
          <a href="#" className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors text-[#104f32]">
              <Headset size={24} />
            </div>
            <span className="text-xs font-semibold text-[#104f32]">
              Assistance
            </span>
          </a>

          <Link
            href="/login"
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors text-[#104f32]">
              <User size={24} />
            </div>
            <span className="text-xs font-semibold text-[#104f32]">Compte</span>
          </Link>

          <Link
            href="/wishlist"
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors text-[#104f32]">
              <Heart size={24} />
            </div>
            <span className="text-xs font-semibold text-[#104f32]">
              Mes produits
            </span>
          </Link>

          <Link href="/cart" className="flex flex-col items-center gap-1 group">
            <div className="relative p-2 rounded-full group-hover:bg-gray-100 transition-colors text-[#104f32]">
              <ShoppingCart size={24} />
              <span className="absolute top-1 right-0 bg-[#ea580c] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">
                0
              </span>
            </div>
            <span className="text-xs font-semibold text-[#104f32]">Panier</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainHeader;
