"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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
        <div className="relative w-32 h-12">
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
            <span className="text-emerald-700 font-bold text-xl tracking-tight">
              Boutique
            </span>
            <span className="text-emerald-500 font-semibold text-sm -mt-1">
              Diary
            </span>
          </div>
          <svg
            className="w-8 h-8 text-emerald-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 8.5 8.5 10 10 11V22H14V11C15.5 10 16.5 8.5 16.5 6.5C16.5 4 14.5 2 12 2Z" />
            <circle cx="9" cy="5" r="2" fill="#22c55e" />
            <circle cx="15" cy="5" r="2" fill="#22c55e" />
            <path
              d="M12 2C12 2 10 0 8 2"
              stroke="#15803d"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M12 2C12 2 14 0 16 2"
              stroke="#15803d"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </>
      )}
    </Link>
  );

  return (
    <>
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <LogoComponent />

            {/* Desktop Menu - Visible on large screens */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/shop"
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              >
                Boutique
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg"
              >
                Inscription
              </Link>
            </div>

            {/* Mobile Menu Button - Hidden on large screens */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center w-12 h-10 bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label="Menu"
            >
              <div className="flex flex-col gap-1">
                <span
                  className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                />
                <span
                  className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Only visible on small screens */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-50 transition-all duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo in Menu */}
            <div onClick={() => setIsMenuOpen(false)}>
              <LogoComponent />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center w-12 h-10 bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all duration-300 shadow-md"
              aria-label="Fermer"
            >
              <div className="flex flex-col gap-1">
                <span className="block w-5 h-0.5 bg-white rotate-45 translate-y-1.5" />
                <span className="block w-5 h-0.5 bg-white opacity-0" />
                <span className="block w-5 h-0.5 bg-white -rotate-45 -translate-y-1.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Menu Links */}
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-8">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="text-4xl font-bold text-gray-800 hover:text-emerald-600 transition-colors"
          >
            Accueil
          </Link>
          <Link
            href="/shop"
            onClick={() => setIsMenuOpen(false)}
            className="text-4xl font-bold text-gray-800 hover:text-emerald-600 transition-colors"
          >
            Boutique
          </Link>
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="text-4xl font-bold text-gray-800 hover:text-emerald-600 transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            onClick={() => setIsMenuOpen(false)}
            className="text-4xl font-bold text-gray-800 hover:text-emerald-600 transition-colors"
          >
            Inscription
          </Link>
        </div>
      </div>
    </>
  );
}
