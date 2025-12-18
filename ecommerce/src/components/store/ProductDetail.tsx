"use client";

import Image from "next/image";
import { Star, Check, AlertCircle, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { COLOR_MAP } from "@/lib/constants";
import { useCartStore } from "@/lib/cart-store";
import anime from "animejs";

interface ProductDetailProps {
  product: any;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  // State for selections
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Derived state from current selection (Image acts as Variant)
  const images =
    product?.images?.length > 0 ? product.images : [{ id: 0, url: null }];
  const currentImage = images[selectedImageIndex];

  // Specific data for the selected variant (image)
  const displayPrice = currentImage?.price ?? product?.price;
  const displayOldPrice = currentImage?.oldPrice ?? product?.oldPrice;
  const displayStock = currentImage?.stock ?? product?.stock;
  const currentRef = currentImage?.reference ?? product?.reference;

  // Available options
  // Colors are effectively different images. We can group images by color or just list unique colors from product.colors
  // When a user clicks a color, we find the first image with that color.
  const uniqueColors = product?.colors || [];

  // Available sizes for the CURRENT variant selection.
  // If specific image has sizes, use those. Otherwise fallback to product global sizes.
  const availableSizes =
    currentImage?.sizes && currentImage.sizes.length > 0
      ? currentImage.sizes
      : product?.sizes || [];

  // Update selected size if it's no longer available when switching variants
  useEffect(() => {
    if (selectedSize && !availableSizes.includes(selectedSize)) {
      setSelectedSize(null);
    }
  }, [selectedImageIndex, availableSizes, selectedSize]);

  // Entrance Animations
  useEffect(() => {
    anime({
      targets: ".product-image-container",
      scale: [0.95, 1],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: 1200,
    });

    anime({
      targets: ".product-info-stagger > *",
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100, { start: 200 }),
      easing: "easeOutQuad",
      duration: 800,
    });
  }, []);

  const handleColorSelect = (color: string) => {
    // Find first image matching this color
    const index = images.findIndex((img: any) => img.color === color);
    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };

  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      reference: currentRef || product.reference,
      image: currentImage?.url || "",
      price: displayPrice || 0,
      quantity: quantity,
      maxStock: displayStock,
      color: currentImage?.color || undefined,
      size: selectedSize || undefined,
    });

    // Reset quantity
    setQuantity(1);
  };

  if (!product) {
    return (
      <div className="p-16 text-center text-red-500">Produit non trouvé</div>
    );
  }

  // Percentage calc
  const hasDiscount = displayOldPrice && displayOldPrice > displayPrice;
  const discountPercent = hasDiscount
    ? Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100)
    : 0;

  return (
    <section className="py-8 md:py-16 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_450px] gap-12 items-start">
        {/* Gallery Section */}
        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
          {/* Thumbnails - Vertical on Desktop */}
          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible order-2 md:order-1">
            {images.map((img: any, i: number) => (
              <button
                key={img.id || i}
                onClick={() => setSelectedImageIndex(i)}
                className={cn(
                  "relative flex-shrink-0 w-16 h-16 md:w-full md:h-auto md:aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all",
                  selectedImageIndex === i
                    ? "border-black ring-1 ring-black/20"
                    : "border-transparent hover:border-gray-300",
                )}
              >
                {img.url && (
                  <Image
                    src={img.url}
                    alt={`${product.name} - View ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="product-image-container opacity-0 relative bg-gray-50 rounded-[40px] aspect-[3/4] md:aspect-[4/5] max-h-[450px] md:max-h-[600px] overflow-hidden order-1 md:order-2 group mx-auto w-full md:w-[95%] shadow-2xl shadow-black/5">
            {currentImage?.url ? (
              <Image
                src={currentImage.url}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xl">
                [Image Principale]
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Nouveau
                </span>
              )}
              {hasDiscount && (
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  -{discountPercent}%
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Top Vente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="product-info-stagger flex flex-col gap-8">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500 font-medium mb-2 block uppercase tracking-wide">
                {product.category?.name || "Boutique"}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Ref: {currentRef}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 tracking-tighter leading-tight">
              {product.name}
            </h1>

            {/* Price Block */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-bold tracking-tight">
                ${displayPrice?.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-gray-400 line-through text-lg mb-1">
                  ${displayOldPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4 fill-current",
                      i < Math.round(product.rating || 0)
                        ? "text-amber-500"
                        : "text-gray-200",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {product.rating || 0} ({product.reviewCount || 0} avis)
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 my-2" />

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description || "Aucune description disponible."}
              </p>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <div className="flex justify-between mb-3">
                <h3 className="font-bold text-gray-900">
                  Couleur:{" "}
                  <span className="font-normal text-gray-500">
                    {currentImage?.color || "Standard"}
                  </span>
                </h3>
              </div>
              <div className="flex gap-3">
                {uniqueColors.length > 0 ? (
                  uniqueColors.map((color: string) => {
                    const isSelected = currentImage?.color === color;
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all p-0.5 relative",
                          isSelected
                            ? "border-black ring-1 ring-black"
                            : "border-gray-200 hover:border-gray-400",
                        )}
                        title={color}
                      >
                        <span
                          className="block w-full h-full rounded-full border border-black/5 shadow-inner"
                          style={{ background: COLOR_MAP[color] || color }} // Use map or fallback to raw
                        />
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-400 italic">
                    Aucune variante couleur
                  </span>
                )}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                <h3 className="font-bold text-gray-900">
                  Taille:{" "}
                  <span className="font-normal text-gray-500">
                    {selectedSize || "Sélectionnez"}
                  </span>
                </h3>
                <button className="text-xs text-black underline">
                  Guide des tailles
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {availableSizes.length > 0 ? (
                  availableSizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "h-12 min-w-[3rem] px-4 rounded-lg border font-medium flex items-center justify-center transition-all",
                        selectedSize === size
                          ? "bg-black text-white border-black shadow-md"
                          : "border-gray-200 text-gray-700 hover:border-black",
                      )}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">
                    Taille unique
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {displayStock > 0 ? (
                <div className="flex items-center text-green-600 text-sm font-medium gap-2 p-3 bg-green-50 rounded-lg w-fit">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  En Stock ({displayStock} disponibles)
                </div>
              ) : (
                <div className="flex items-center text-red-600 text-sm font-medium gap-2 p-3 bg-red-50 rounded-lg w-fit">
                  <AlertCircle className="w-4 h-4" />
                  Rupture de stock
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex border border-gray-100 bg-gray-50/50 backdrop-blur-sm rounded-2xl items-center p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 hover:bg-white rounded-xl transition-all font-black text-xl"
                >
                  -
                </button>
                <span className="w-10 text-center font-black text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(displayStock, quantity + 1))
                  }
                  className="w-12 h-12 hover:bg-white rounded-xl transition-all font-black text-xl"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={displayStock <= 0}
                className={cn(
                  "flex-1 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]",
                  displayStock > 0
                    ? "bg-black text-white hover:bg-gray-800 shadow-black/10"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed",
                )}
              >
                <ShoppingCart className="w-6 h-6" />
                {displayStock > 0 ? "Ajouter au panier" : "Indisponible"}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Livraison gratuite pour les commandes de plus de $200. Retours
              sous 30 jours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
