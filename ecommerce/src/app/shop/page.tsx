"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/formatPrice";
import { Heart, ShoppingBasket, X, Check } from "lucide-react";
import { Product } from "@/types/admin";
import { useRouter, useSearchParams } from "next/navigation";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartState, setCartState] = useState<Record<number, number>>({});

  const [selectedImages, setSelectedImages] = useState<Record<number, number>>(
    {},
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const showPromosOnly = searchParams.get("promo") === "true";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [maxLoadedPage, setMaxLoadedPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [scrollTarget, setScrollTarget] = useState<number | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    setMaxLoadedPage(1);
  }, [showPromosOnly]);

  const filteredProducts = showPromosOnly
    ? products.filter((p) => p.isPromotion)
    : products;

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = filteredProducts.slice(
    0,
    maxLoadedPage * ITEMS_PER_PAGE,
  );

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && maxLoadedPage < totalPages) {
          setMaxLoadedPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [totalPages, maxLoadedPage]);

  useEffect(() => {
    const handleScrollSpy = () => {
      if (isAutoScrolling) return;

      const headerOffset = 150;

      let activePage = 1;

      for (let i = 1; i <= maxLoadedPage; i++) {
        const productIndex = (i - 1) * ITEMS_PER_PAGE;
        const element = document.getElementById(`product-card-${productIndex}`);

        if (element) {
          const rect = element.getBoundingClientRect();

          if (rect.top < window.innerHeight / 2 + headerOffset) {
            activePage = i;
          }
        }
      }

      if (activePage !== currentPage) {
        setCurrentPage(activePage);
      }

      setShowPagination(window.scrollY > 1000);
    };

    window.addEventListener("scroll", handleScrollSpy);
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [maxLoadedPage, currentPage, isAutoScrolling]);

  useEffect(() => {
    if (scrollTarget !== null) {
      const element = document.getElementById(`product-card-${scrollTarget}`);
      if (element) {
        const headerOffset = 150;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        setScrollTarget(null);
        setTimeout(() => setIsAutoScrolling(false), 1000);
      }
    }
  }, [displayedProducts, scrollTarget]);

  const handlePageClick = (page: number) => {
    setIsAutoScrolling(true);
    setCurrentPage(page);
    setMaxLoadedPage((prev) => Math.max(prev, page));
    const targetIndex = (page - 1) * ITEMS_PER_PAGE;
    setScrollTarget(targetIndex);
  };

  const [showPagination, setShowPagination] = useState(false);

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.png";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const cleanPath = url.replace(/^public[\\/]/, "").replace(/\\/g, "/");
    return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  };

  // Helper to convert color names to hex codes
  const getColorCode = (colorName: string): string => {
    const map: Record<string, string> = {
      Rouge: "#ef4444",
      Bleu: "#3b82f6",
      "Bleu foncé": "#1e3a8a",
      Vert: "#22c55e",
      Noir: "#000000",
      Blanc: "#ffffff",
      Jaune: "#eab308",
      Rose: "#ec4899",
      Gris: "#6b7280",
      Violet: "#a855f7",
      Orange: "#f97316",
      Marron: "#78350f",
      "Bleu Ciel": "#0ea5e9",
      "Vert Clair": "#86efac",
      Beige: "#f5f5dc",
      Or: "#ffd700",
      Argent: "#c0c0c0",
      Corail: "#ff6b6b",
      Turquoise: "#40e0d0",
      Saumon: "#fa8072",
      "Epicerie salée": "#d97706",
      "Epicerie sucrée": "#b45309",
    };
    return map[colorName] || colorName;
  };

  const handleProductClick = (product: Product) => {
    const slug = product.name
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-");
    router.push(`/shop/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {showPromosOnly ? "Nos Promotions" : "Notre Boutique"}
          </h1>
          <p className="text-lg text-gray-600">
            {showPromosOnly
              ? "Profitez de nos meilleures offres !"
              : "Découvrez notre sélection de produits"}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              {showPromosOnly
                ? "Aucune promotion en cours"
                : "Aucun produit disponible pour le moment"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {displayedProducts.map((product, index) => {
                const firstImage = product.images?.[0];
                const firstImageStock =
                  typeof firstImage === "object" &&
                  firstImage?.stock !== undefined &&
                  firstImage?.stock !== null
                    ? firstImage.stock
                    : null;
                const effectiveStock =
                  firstImageStock !== null ? firstImageStock : product.stock;
                const isOutOfStock = effectiveStock === 0;

                return (
                  <div
                    key={product.id}
                    id={`product-card-${index}`}
                    className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-gray-200 cursor-pointer overflow-hidden scroll-mt-40"
                    onClick={() => handleProductClick(product)}
                  >
                    {}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {isOutOfStock && (
                        <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                          Rupture de stock
                        </span>
                      )}
                      {product.isBestSeller && (
                        <span className="bg-[#15803d] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                          Top vente
                        </span>
                      )}
                      {product.isNew && (
                        <span className="bg-[#15803d] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                          Nouveau
                        </span>
                      )}
                      {product.isPromotion && (
                        <>
                          <span className="bg-[#e11d48] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                            Promo
                          </span>
                          {product.oldPrice &&
                            product.oldPrice > product.price && (
                              <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-rose-200">
                                -
                                {Math.round(
                                  ((product.oldPrice - product.price) /
                                    product.oldPrice) *
                                    100,
                                )}
                                %
                              </span>
                            )}
                        </>
                      )}
                    </div>

                    {}
                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">
                      <button
                        className="text-emerald-700 hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Wishlist click");
                        }}
                      >
                        <Heart size={20} />
                      </button>
                    </div>

                    {}
                    {(() => {
                      const selectedIndex = selectedImages[product.id!] ?? 0;
                      const displayImage =
                        product.images?.[selectedIndex] ?? product.images?.[0];
                      const imageUrl = displayImage
                        ? typeof displayImage === "string"
                          ? displayImage
                          : displayImage.url
                        : null;

                      return (
                        <div
                          className={`block relative aspect-square mb-4 overflow-hidden ${isOutOfStock ? "opacity-50" : ""}`}
                        >
                          {imageUrl ? (
                            <Image
                              src={getImageUrl(imageUrl)}
                              alt={product.name}
                              fill
                              className="object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <span className="text-gray-300">No Image</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {}
                    <div className="space-y-2">
                      <h3 className="text-sm font-[800] text-[#1f2937] leading-tight min-h-[40px] line-clamp-2 hover:text-rose-600 transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">
                        {product.description || "Aucune description"}
                      </p>

                      {}
                      {(() => {
                        const imageColorsWithIndex = product.images
                          ?.map((img, index) => ({
                            color: typeof img === "object" ? img.color : null,
                            index,
                          }))
                          .filter(
                            (item): item is { color: string; index: number } =>
                              item.color !== null && item.color !== undefined,
                          );

                        const colorIndexMap = new Map<string, number>();
                        imageColorsWithIndex?.forEach((item) => {
                          if (!colorIndexMap.has(item.color)) {
                            colorIndexMap.set(item.color, item.index);
                          }
                        });

                        const uniqueColors = Array.from(
                          colorIndexMap.keys(),
                        ).slice(0, 6);
                        const currentSelectedIndex =
                          selectedImages[product.id!] ?? 0;

                        if (uniqueColors.length > 0) {
                          return (
                            <div className="flex items-center gap-2 mt-2">
                              {uniqueColors.map((color) => {
                                const imageIndex =
                                  colorIndexMap.get(color) ?? 0;
                                const isSelected =
                                  currentSelectedIndex === imageIndex;

                                return (
                                  <button
                                    key={color}
                                    title={color}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedImages((prev) => ({
                                        ...prev,
                                        [product.id!]: imageIndex,
                                      }));
                                    }}
                                    className={`w-5 h-5 rounded-full border-2 shadow-sm transition-all hover:scale-110 ${
                                      isSelected
                                        ? "border-gray-800 ring-2 ring-gray-300"
                                        : "border-gray-200"
                                    }`}
                                    style={{
                                      backgroundColor: getColorCode(color),
                                    }}
                                  />
                                );
                              })}
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="flex items-end justify-between mt-4">
                        <div className="flex flex-col">
                          {product.isPromotion && product.oldPrice ? (
                            <>
                              <span className="text-sm text-gray-500 line-through decoration-black">
                                {formatPrice(product.oldPrice)}
                              </span>
                              <span className="text-lg font-[800] text-red-600">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-[800] text-[#1f2937]">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>

                        {}
                        {cartState[product.id!] ? (
                          <div
                            className="flex items-center justify-between min-w-[100px] h-10 rounded-full border border-emerald-500 bg-white shadow-sm px-1 transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                setCartState((prev) => {
                                  const newState = { ...prev };
                                  delete newState[product.id!];
                                  return newState;
                                })
                              }
                              className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>

                            <input
                              type="number"
                              min="1"
                              max={effectiveStock}
                              value={cartState[product.id!]}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                  setCartState((prev) => ({
                                    ...prev,
                                    [product.id!]: Math.min(
                                      val,
                                      effectiveStock,
                                    ),
                                  }));
                                }
                              }}
                              className="w-12 text-center font-bold text-gray-900 text-sm mx-1 border-b border-emerald-500 focus:outline-none appearance-none"
                              onClick={(e) => e.stopPropagation()}
                            />

                            <button
                              onClick={() => {
                                console.log("Confirmed item in cart");
                              }}
                              className="w-8 h-full flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={isOutOfStock}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors shadow-sm ${
                              !isOutOfStock
                                ? "bg-[#15803d] text-white hover:bg-[#166534]"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            aria-label={
                              isOutOfStock
                                ? "Rupture de stock"
                                : "Ajouter au panier"
                            }
                            title={
                              isOutOfStock
                                ? "Rupture de stock"
                                : "Ajouter au panier"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isOutOfStock) {
                                setCartState((prev) => ({
                                  ...prev,
                                  [product.id!]: 1,
                                }));
                              }
                            }}
                          >
                            <ShoppingBasket size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {}
            <div
              ref={observerTarget}
              className="h-4 w-full"
              aria-hidden="true"
            />

            {}
            {totalPages > 1 && (
              <div
                className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-4 px-4 sm:px-6 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 ${
                  showPagination ? "translate-y-0" : "translate-y-full"
                }`}
              >
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                  {}
                  <div className="hidden sm:block w-[100px]"></div>

                  {}
                  <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar mx-auto">
                    <button
                      onClick={() =>
                        handlePageClick(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <span className="font-bold">{"<"}</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && (
                              <span className="mx-1 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageClick(page)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                currentPage === page
                                  ? "bg-[#d1fae5] text-[#104f32]" // Active state
                                  : currentPage > page
                                    ? "bg-gray-50 text-gray-400" // Past pages
                                    : "text-gray-600 hover:bg-gray-100" // Future pages
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}

                    <button
                      onClick={() =>
                        handlePageClick(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <span className="font-bold">{">"}</span>
                    </button>
                  </div>

                  {}
                  <div className="hidden sm:flex w-[100px] justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#104f32] text-white rounded-lg font-bold hover:bg-[#0d3f28] transition-colors">
                      <span>Filtrer</span>
                      <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                        1
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
