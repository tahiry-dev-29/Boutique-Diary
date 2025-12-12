"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  User,
  ShoppingCart,
  Heart,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const ClientNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(0);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top bar - Promo */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
        🚚 Livraison gratuite à partir de 50€ d&apos;achat
      </div>

      {/* Main nav */}
      <nav className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex flex-col leading-none">
              <span className="text-primary font-bold text-xl tracking-tight">
                BOUTIQUE
              </span>
              <span className="text-muted-foreground text-xs tracking-widest">
                DIARY
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/shop"
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-accent"
            >
              Boutique
            </Link>
            <Link
              href="/shop?promo=true"
              className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
            >
              🔥 Promos
            </Link>
            <div className="relative group">
              <button className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-accent flex items-center gap-1">
                Catégories
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full bg-muted border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:bg-background transition-all outline-none"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            {/* Mobile search */}
            <button className="lg:hidden p-2 rounded-full hover:bg-accent transition-colors text-foreground">
              <Search size={20} />
            </button>

            {/* Account */}
            <Link
              href="/customer/auth"
              className="p-2 rounded-full hover:bg-accent transition-colors text-foreground flex items-center gap-2"
            >
              <User size={20} />
              <span className="hidden md:inline text-sm font-medium">
                Compte
              </span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/customer/wishlist"
              className="p-2 rounded-full hover:bg-accent transition-colors text-foreground"
            >
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-accent transition-colors text-foreground"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-accent transition-colors text-foreground"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-slide-in">
            <div className="flex flex-col gap-2">
              <Link
                href="/shop"
                className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🛍️ Boutique
              </Link>
              <Link
                href="/shop?promo=true"
                className="px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🔥 Promos
              </Link>
              <Link
                href="/customer/auth"
                className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                👤 Mon compte
              </Link>
              <Link
                href="/customer/wishlist"
                className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ❤️ Mes favoris
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default ClientNavbar;
