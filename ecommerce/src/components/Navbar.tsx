"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  X,
  Facebook,
  Instagram,
  Youtube,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");

  // Charger le logo depuis l'API
  useEffect(() => {
    async function fetchLogo() {
      try {
        const response = await fetch("/api/settings?key=logo");
        if (response.ok) {
          const data = await response.json();
          if (data && data.value) {
            setLogoUrl(data.value);
          }
        }
      } catch (error) {
        console.error("Erreur chargement logo:", error);
      }
    }
    fetchLogo();
  }, []);

  // Logo composant réutilisable
  const LogoComponent = () => (
    <Link href="/" className="flex items-center gap-2">
      {logoUrl ? (
        <div className="relative w-48 h-16">
          <Image
            src={logoUrl}
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-emerald-700 font-bold text-2xl tracking-tight">
              marmalade
            </span>
            <span className="text-[#a3b10b] font-bold text-2xl -mt-2">
              lion.
            </span>
          </div>
        </>
      )}
    </Link>
  );

  return (
    <header className="w-full font-sans">
      {/* 1. TOP BAR - Dark Green */}
      <div className="bg-[#15803d] text-white py-2 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center text-sm">
          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <Facebook size={18} fill="currentColor" strokeWidth={0} />
            <Instagram size={18} />
            {/* Pinterest icon often needs a custom SVG as it's not always in all sets, using a placeholder or generic if needed, 
                but lucide doesn't have a standard Pinterest fill usually. We'll stick to text or standard icons for now. */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0"
              className="w-[18px] h-[18px]"
            >
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.487-.695-2.435-2.878-2.435-4.646 0-3.786 2.75-7.262 7.928-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
            </svg>
            <Youtube size={18} fill="currentColor" strokeWidth={0} />
          </div>

          {/* Promo Right */}
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide text-xs md:text-sm">
              BUY NOW, PAY LATER
            </span>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
              {/* Placeholders for payment icons */}
              <span className="font-bold italic text-xs">afterpay</span>
              <span className="font-bold text-xs bg-black text-white px-1 ml-1">
                zip
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER - White */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <LogoComponent />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl w-full mx-4">
            <div className="flex items-center border border-gray-300 rounded-full overflow-hidden px-4 py-2 bg-white hover:shadow-sm transition-shadow">
              <button className="flex items-center gap-1 text-gray-500 text-sm font-medium border-r border-gray-300 pr-3 mr-3 hover:text-gray-700">
                All Categories <ChevronDown size={14} />
              </button>
              <input
                type="text"
                placeholder="Search for products"
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm"
              />
              <Search
                className="text-gray-400 cursor-pointer hover:text-[#15803d]"
                size={20}
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-6 text-gray-700">
            <Link
              href="/login"
              className="hover:text-[#15803d] transition-colors"
            >
              <User size={24} />
            </Link>
            <Link
              href="/cart"
              className="relative hover:text-[#15803d] transition-colors"
            >
              <ShoppingCart size={24} />
              <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                0
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION BAR - Dark Green */}
      <div className="bg-[#15803d] hidden md:block border-t border-white/20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <ul className="flex items-center justify-center gap-8 py-3 text-white text-sm font-medium tracking-wide">
            <li>
              <Link
                href="/shop"
                className="flex items-center gap-1 hover:text-gray-100 transition-colors"
              >
                SHOP <ChevronDown size={12} />
              </Link>
            </li>
            <li className="hover:text-gray-100 transition-colors">
              <Link href="/designs">DESIGNS</Link>
            </li>
            <li className="hover:text-gray-100 transition-colors">
              <Link href="/category/mats">BABY PLAY MATS</Link>
            </li>
            <li className="hover:text-gray-100 transition-colors">
              <Link href="/category/liners">PRAM LINERS</Link>
            </li>
            <li className="hover:text-gray-100 transition-colors">
              <Link href="/category/dolls">NESTING DOLLS</Link>
            </li>
            <li className="hover:text-gray-100 transition-colors">
              <Link href="/category/bundles">BABY BUNDLES</Link>
            </li>
            <li className="hover:text-gray-100 transition-colors">
              <Link href="/category/hampers">BABY HAMPERS</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[140px] left-0 w-full bg-white shadow-lg border-t border-gray-100 z-50">
          <ul className="flex flex-col p-4 text-gray-700">
            <li className="py-2 border-b border-gray-50">
              <Link href="/shop" onClick={() => setIsMenuOpen(false)}>
                Shop
              </Link>
            </li>
            <li className="py-2 border-b border-gray-50">
              <Link href="/designs" onClick={() => setIsMenuOpen(false)}>
                Designs
              </Link>
            </li>
            <li className="py-2 border-b border-gray-50">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </li>
            <li className="py-2">
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
