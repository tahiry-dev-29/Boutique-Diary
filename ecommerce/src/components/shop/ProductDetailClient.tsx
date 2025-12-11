"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/formatPrice";
import { Minus, Plus, Star } from "lucide-react";

interface ProductImage {
  url: string;
  color?: string | null;
  sizes?: string[];
  price?: number | null;
  oldPrice?: number | null;
  stock?: number | null;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  reference: string;
  images: ProductImage[];
  price: number;
  stock: number;
  colors: string[];
  sizes: string[];
  isNew: boolean;
  isPromotion: boolean;
  oldPrice?: number | null;
  isBestSeller: boolean;
  rating?: number | null;
  reviewCount?: number;
}

interface ProductDetailClientProps {
  product: Product;
}

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
  };
  return map[colorName] || colorName;
};

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.url || "/placeholder.png",
  );

  const initialColor = product.images[0]?.color || product.colors[0] || null;
  const [selectedColor, setSelectedColor] = useState(initialColor);

  const initialSize =
    product.images[0]?.sizes && product.images[0].sizes.length > 0
      ? product.images[0].sizes[0]
      : product.sizes[0] || null;
  const [selectedSize, setSelectedSize] = useState(initialSize);

  const [quantity, setQuantity] = useState(1);

  const selectedImageIndex = product.images.findIndex(
    (img) => img.url === selectedImage,
  );
  const currentImage =
    selectedImageIndex !== -1 ? product.images[selectedImageIndex] : null;

  const currentStock =
    currentImage?.stock !== undefined && currentImage?.stock !== null
      ? currentImage.stock
      : product.stock;

  const selectImageAndSyncStock = (imgUrl: string) => {
    setSelectedImage(imgUrl);

    const img = product.images.find((i) => i.url === imgUrl);
    const newStock =
      img?.stock !== undefined && img?.stock !== null
        ? img.stock
        : product.stock;

    if (quantity > newStock) {
      setQuantity(Math.max(1, newStock > 0 ? newStock : 1));
    }
  };

  const currentPrice =
    currentImage?.price !== undefined && currentImage?.price !== null
      ? currentImage.price
      : product.price;

  const currentOldPrice =
    currentImage?.oldPrice !== undefined && currentImage?.oldPrice !== null
      ? currentImage.oldPrice
      : product.oldPrice;

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.png";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const cleanPath = url.replace(/^public[\\/]/, "").replace(/\\/g, "/");
    return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, currentStock)));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {}
        {}
        <div className="flex flex-col-reverse md:flex-row gap-6">
          {}
          {product.images.length > 1 && (
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:max-h-[500px] w-full md:w-24 flex-shrink-0 scrollbar-hide py-2 md:py-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    selectImageAndSyncStock(img.url);
                    if (img.color) {
                      setSelectedColor(img.color);
                    }
                  }}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img.url
                      ? "border-rose-500 opacity-100 ring-2 ring-rose-500 ring-offset-1"
                      : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={getImageUrl(img.url)}
                    alt={`${product.name} view ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {}
          <div className="relative aspect-square flex-1 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            <Image
              src={getImageUrl(selectedImage)}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>
        </div>

        {}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                {product.reference}
              </span>
              {product.isBestSeller && (
                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                  TOP
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            <p className="text-gray-600 leading-relaxed">
              {product.description ||
                "No description available for this product."}
            </p>

            {}
            {product.rating && product.rating > 0 && (
              <div className="flex items-center gap-4 mt-4">
                <div className="flex text-rose-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill="currentColor"
                      className={
                        star <= (product.rating || 0)
                          ? "text-rose-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                {product.reviewCount && product.reviewCount > 0 && (
                  <span className="text-sm text-gray-500">
                    Aimé par {product.reviewCount} utilisateurs
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          {}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {currentOldPrice && currentOldPrice > currentPrice && (
                <span className="text-sm text-rose-500 line-through mb-1">
                  {formatPrice(currentOldPrice)}
                </span>
              )}
              <span
                className={`text-3xl font-bold ${
                  product.isPromotion ? "text-rose-600" : "text-gray-900"
                }`}
              >
                {formatPrice(currentPrice)}
              </span>
              {currentOldPrice && currentOldPrice > currentPrice && (
                <span className="bg-rose-100 text-rose-600 text-sm font-bold px-3 py-1 rounded-full border border-rose-200 self-start mt-1">
                  -
                  {Math.round(
                    ((currentOldPrice - currentPrice) / currentOldPrice) * 100,
                  )}
                  %
                </span>
              )}
            </div>
          </div>

          {product.colors.length > 0 && (
            <div className="space-y-3">
              <span className="text-sm font-medium text-gray-500 block mb-2">
                Couleur:{" "}
                <span className="text-gray-900 font-bold">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => {
                  const colorCode = getColorCode(color);

                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);

                        const imageWithColor = product.images.find(
                          (img) => img.color === color,
                        );
                        if (imageWithColor) {
                          selectImageAndSyncStock(imageWithColor.url);
                        }
                      }}
                      title={color}
                      className={`w-10 h-10 rounded-lg transition-all focus:outline-none ${
                        selectedColor === color
                          ? "ring-2 ring-rose-500 ring-offset-2 scale-110 shadow-sm" // Active State: Ring with offset
                          : "hover:scale-105 border border-gray-200" // Inactive: subtle border
                      }`}
                      style={{ backgroundColor: colorCode }}
                    >
                      <span className="sr-only">{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {}
          {product.sizes.length > 0 && (
            <div className="space-y-3">
              <span className="text-sm font-medium text-gray-500">
                Taille:{" "}
                <span className="text-gray-900 font-bold">{selectedSize}</span>
              </span>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => {
                  let isAvailable = true;

                  if (
                    currentImage &&
                    currentImage.sizes &&
                    currentImage.sizes.length > 0
                  ) {
                    isAvailable = currentImage.sizes.includes(size);
                  }

                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`px-4 py-2 rounded text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                        selectedSize === size
                          ? "bg-rose-500 text-white shadow-md transform scale-105"
                          : isAvailable
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {}
            <div className="flex items-center border border-gray-200 rounded-lg p-1 w-max">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-rose-600 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-bold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-rose-600 transition-colors"
                disabled={quantity >= currentStock}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex items-center text-sm text-gray-500 self-center">
              Stock:{" "}
              <span className="font-bold text-gray-900 ml-1">
                {currentStock}
              </span>
            </div>
          </div>

          {}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-4">
              <button className="py-4 rounded-lg font-bold text-gray-700 border-2 border-gray-200 hover:border-gray-900 hover:text-gray-900 transition-all uppercase tracking-wider text-sm">
                Ajouter au panier
              </button>
              <button className="py-4 rounded-lg font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all uppercase tracking-wider text-sm">
                Acheter maintenant
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              Livraison gratuite pour les commandes de plus de 50€ • Retour sous
              30 jours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
