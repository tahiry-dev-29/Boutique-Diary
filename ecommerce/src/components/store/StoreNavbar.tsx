"use client";

import Link from "next/link";
import { Search, ShoppingBag, User, Menu } from "lucide-react";
import { useState } from "react";
import CartSidebar from "./CartSidebar";

export default function StoreNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-white sticky top-0 z-50 py-4">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-black"
          >
            Meher
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-500">
            <Link
              href="/"
              className="hover:text-black transition-colors font-semibold text-black"
            >
              Home
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              Product
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              About Us
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              Starter
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              Blog
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
              <Search className="w-5 h-5 text-gray-400" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
            >
              <ShoppingBag className="w-5 h-5 text-gray-400 group-hover:text-black" />
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            <Link
              href="#"
              className="hidden md:block px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6 text-black" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 py-4 px-4 flex flex-col gap-4 shadow-lg z-50">
            <Link href="/" className="text-sm font-medium text-black">
              Home
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600">
              Product
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600">
              About Us
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600">
              Starter
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600">
              Blog
            </Link>
          </div>
        )}
      </nav>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
