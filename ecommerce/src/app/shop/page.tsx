"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/formatPrice";
import { Heart, ShoppingBasket, X, Check } from "lucide-react";
import { Product } from "@/types/admin";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartState, setCartState] = useState<Record<number, number>>({});
  // Track selected image index per product (productId -> imageIndex)
  const [selectedImages, setSelectedImages] = useState<Record<number, number>>(
    {}
  );
  const router = useRouter();

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
    };
    return map[colorName] || colorName;
  };

  const handleProductClick = (product: Product) => {
    // Create a slug from the product name
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
            Notre Boutique
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez notre sélection de produits
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              Aucun produit disponible pour le moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => {
              // Calculate effective stock: use first image stock if available, otherwise product stock
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
                  className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-gray-200 cursor-pointer overflow-hidden"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Badges */}
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
                                  100
                              )}
                              %
                            </span>
                          )}
                      </>
                    )}
                  </div>

                  {/* Wishlist Heart - Hidden by default, visible on hover */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">
                    <button
                      className="text-emerald-700 hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation
                        console.log("Wishlist click");
                      }}
                    >
                      <Heart size={20} />
                    </button>
                  </div>

                  {/* Image */}
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

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-[800] text-[#1f2937] leading-tight min-h-[40px] line-clamp-2 hover:text-rose-600 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">
                      {product.description || "Aucune description"}
                    </p>

                    {/* Color Dots - from product images or product.colors */}
                    {(() => {
                      // Extract unique colors from images with their indices
                      const imageColorsWithIndex = product.images
                        ?.map((img, index) => ({
                          color: typeof img === "object" ? img.color : null,
                          index,
                        }))
                        .filter(
                          (item): item is { color: string; index: number } =>
                            item.color !== null && item.color !== undefined
                        );

                      // Get unique colors (keep first occurrence index for each color)
                      const colorIndexMap = new Map<string, number>();
                      imageColorsWithIndex?.forEach((item) => {
                        if (!colorIndexMap.has(item.color)) {
                          colorIndexMap.set(item.color, item.index);
                        }
                      });

                      const uniqueColors = Array.from(
                        colorIndexMap.keys()
                      ).slice(0, 6);
                      const currentSelectedIndex =
                        selectedImages[product.id!] ?? 0;

                      if (uniqueColors.length > 0) {
                        return (
                          <div className="flex items-center gap-2 mt-2">
                            {uniqueColors.map((color) => {
                              const imageIndex = colorIndexMap.get(color) ?? 0;
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

                      {/* Cart Interaction UI */}
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
                                  [product.id!]: Math.min(val, effectiveStock),
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
        )}
      </div>
    </div>
  );
}
