"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Package, Layers, Loader2, ArrowRight } from "lucide-react";
import { searchStore } from "@/app/actions/search";
import Image from "next/image";
import { formatPrice } from "@/lib/cart-store";
import { useState, useEffect } from "react";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchCommand({
  open,
  onOpenChange,
}: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    products: any[];
    categories: any[];
  }>({ products: [], categories: [] });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(open => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ products: [], categories: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await searchStore(query);
      setResults(data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    router.push(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-[640px] shadow-2xl rounded-xl overflow-hidden bg-white ring-1 ring-black/5 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center border-b px-4 py-3">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-400 text-gray-900 h-9 font-medium"
              placeholder="Rechercher des produits, catégories..."
              autoFocus
            />
            {loading && <Loader2 className="w-4 h-4 text-black animate-spin" />}
            <div className="ml-2 flex items-center gap-1 text-xs text-gray-400 font-mono border rounded px-1.5 py-0.5 bg-gray-50">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2 scroll-py-2 scrollbar-hide">
            {!loading &&
              query.length > 0 &&
              results.products.length === 0 &&
              results.categories.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-500">
                  Aucun résultat trouvé pour "{query}"
                </div>
              )}

            {results.categories.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Collections
                </div>
                {results.categories.map((cat: any) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelect(`/shop?category=${cat.id}`)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-black cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white text-gray-500">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{cat.name}</span>
                    <ArrowRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-50" />
                  </div>
                ))}
              </div>
            )}

            {results.products.length > 0 && (
              <div>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Produits
                </div>
                {results.products.map((product: any) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelect(`/store/product/${product.id}`)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-black cursor-pointer transition-colors group"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {product.images[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">
                        {product.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.category?.name}
                      </span>
                    </div>
                    <div className="ml-auto font-medium text-gray-900 group-hover:text-black">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.length === 0 && (
              <div className="py-8 px-4 text-center">
                <p className="text-sm text-gray-400">
                  Commencez à taper pour rechercher...
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <button
                    className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    onClick={() => setQuery("Shoes")}
                  >
                    Shoes
                  </button>
                  <button
                    className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    onClick={() => setQuery("Top")}
                  >
                    Top
                  </button>
                  <button
                    className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    onClick={() => setQuery("New")}
                  >
                    New
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
