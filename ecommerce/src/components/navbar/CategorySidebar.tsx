"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronRight, Snowflake, Gift } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CategorySidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategoryInfo = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("noël"))
      return { icon: "🎄", badge: Gift, badgeColor: "text-red-500" };
    if (
      lower.includes("frais") ||
      lower.includes("fruit") ||
      lower.includes("legume")
    )
      return { icon: "🥬", badge: Snowflake, badgeColor: "text-blue-500" };
    if (lower.includes("sucr")) return { icon: "🍫" };
    if (
      lower.includes("salé") ||
      lower.includes("pates") ||
      lower.includes("riz")
    )
      return { icon: "🍝" };
    if (
      lower.includes("boisson") ||
      lower.includes("eau") ||
      lower.includes("jus")
    )
      return { icon: "🥛" };
    if (lower.includes("bébé") || lower.includes("enfant"))
      return { icon: "🧸" };
    if (
      lower.includes("beauté") ||
      lower.includes("hygiène") ||
      lower.includes("parfum")
    )
      return { icon: "🧼" };
    if (lower.includes("santé") || lower.includes("pharmacie"))
      return { icon: "🧴" };
    if (lower.includes("entretien") || lower.includes("ménage"))
      return { icon: "🧹" };
    if (lower.includes("maison") || lower.includes("cuisine"))
      return { icon: "🍳" };
    if (
      lower.includes("animal") ||
      lower.includes("chien") ||
      lower.includes("chat")
    )
      return { icon: "🐾" };
    return { icon: "📦" };
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        suppressHydrationWarning
        className={cn(
          "hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-200 z-50 relative select-none",
          isOpen
            ? "bg-gray-100 text-gray-900 border border-gray-900 shadow-sm"
            : "bg-gray-100 text-[#104f32] border border-[#104f32] hover:bg-gray-50",
        )}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
        <span>Toutes les catégories</span>
      </button>

      {}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[300px] bg-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="flex flex-col py-3 max-h-[80vh] overflow-y-auto">
            {loading ? (
              <li className="px-6 py-4 text-center text-gray-400 text-sm">
                Chargement...
              </li>
            ) : categories.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-400 text-sm">
                Aucune catégorie
              </li>
            ) : (
              categories.map(category => {
                const info = getCategoryInfo(category.name);
                return (
                  <li key={category.id || category.name}>
                    <Link
                      href={`/shop?category=${category.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-green-50/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        {}
                        <span className="text-2xl w-8 text-center leading-none filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-200">
                          {info.icon}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 text-[15px] group-hover:text-[#104f32]">
                            {category.name}
                          </span>

                          {}
                          {info.badge && (
                            <info.badge
                              size={14}
                              className={cn(info.badgeColor)}
                              fill="currentColor"
                            />
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        size={16}
                        className="text-gray-300 group-hover:text-[#104f32] transition-colors"
                      />
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
