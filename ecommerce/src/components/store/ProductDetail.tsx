"use client";

import Image from "next/image";
import {
  Star,
  Check,
  AlertCircle,
  ShoppingCart,
  Heart,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { COLOR_MAP } from "@/lib/constants";
import { useCartStore } from "@/lib/cart-store";
import anime from "animejs";
import { toast } from "sonner";

interface ProductImage {
  id: number;
  url: string;
  color?: string | null;
  reference?: string | null;
  price?: number | null;
  oldPrice?: number | null;
  stock?: number | null;
  sizes?: string[];
}

interface Product {
  id: number;
  name: string;
  reference: string;
  description: string | null;
  price: number;
  oldPrice?: number | null;
  stock: number;
  rating?: number | null;
  reviewCount?: number | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors: string[];
  sizes: string[];
  category?: { name: string } | null;
  images: ProductImage[];
  blogPosts: BlogPost[];
}

interface ProductDetailProps {
  product: Product;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  productImageId: number | null;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const res = await fetch("/api/customer/wishlist");
        if (res.ok) {
          const wishlist = await res.json();
          const isInWishlist = wishlist.some(
            (item: { productId: number }) => item.productId === product.id,
          );
          setIsWishlisted(isInWishlist);
        }
      } catch (err) {
        console.error("Error checking wishlist", err);
      }
    };

    if (product?.id) {
      checkWishlistStatus();
    }
  }, [product?.id]);

  const toggleWishlist = async () => {
    setIsWishlistLoading(true);
    try {
      const res = await fetch("/api/customer/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.added);
        toast.success(
          data.added ? "Ajouté aux favoris" : "Retiré des favoris",
          {
            icon: data.added ? "❤️" : "💔",
          },
        );
      } else if (res.status === 401) {
        toast.error("Veuillez vous connecter pour ajouter des favoris", {
          action: {
            label: "Se connecter",
            onClick: () => (window.location.href = "/login"),
          },
        });
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const images: ProductImage[] =
    product?.images?.length > 0
      ? product.images
      : [
          {
            id: 0,
            url: "",
            color: null,
            reference: null,
            price: null,
            oldPrice: null,
            stock: null,
            sizes: [],
          },
        ];
  const currentImage = images[selectedImageIndex];

  const displayPrice = currentImage?.price ?? product?.price;
  const displayOldPrice = currentImage?.oldPrice ?? product?.oldPrice;
  const displayStock = currentImage?.stock ?? product?.stock;
  const currentRef = currentImage?.reference ?? product?.reference;

  const uniqueColors = product?.colors || [];

  const availableSizes = useMemo(
    () =>
      currentImage?.sizes && currentImage.sizes.length > 0
        ? currentImage.sizes
        : product?.sizes || [],
    [currentImage, product?.sizes],
  );

  useEffect(() => {
    if (selectedSize && !availableSizes.includes(selectedSize)) {
      setSelectedSize(null);
    }
  }, [availableSizes, selectedSize]);

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
    const index = images.findIndex((img) => img.color === color);
    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      productImageId: currentImage?.id,
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

  const hasDiscount = displayOldPrice && displayOldPrice > displayPrice;
  const discountPercent = hasDiscount
    ? Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100)
    : 0;

  const blogPosts: BlogPost[] = product.blogPosts || [];
  const currentBlogPost =
    blogPosts.find((bp) => bp.productImageId === currentImage?.id) ||
    blogPosts.find((bp) => !bp.productImageId);

  return (
    <section className="py-8 md:py-16 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_450px] gap-12 items-start">
        {}
        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
          {}
          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible order-2 md:order-1">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                onClick={() => setSelectedImageIndex(i)}
                className={cn(
                  "relative shrink-0 w-16 h-16 md:w-full md:h-auto md:aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all",
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

          {}
          <div className="product-image-container opacity-0 relative bg-gray-50 rounded-[40px] aspect-3/4 md:aspect-4/5 max-h-[450px] md:max-h-[600px] overflow-hidden order-1 md:order-2 group mx-auto w-full md:w-[95%] shadow-2xl shadow-black/5">
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

            {}
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

        {}
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

            {}
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

            {}
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

            {}
            <div className="h-px bg-gray-100 my-2" />

            {}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description || "Aucune description disponible."}
              </p>
            </div>

            {}
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
                    const index = images.findIndex(
                      (img) => img.color === color,
                    );
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedImageIndex(index)}
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
                          style={{ background: COLOR_MAP[color] || color }}
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

            {}
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
                        "h-12 min-w-12 px-4 rounded-lg border font-medium flex items-center justify-center transition-all",
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

            {}
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

            {}
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

              <button
                onClick={toggleWishlist}
                disabled={isWishlistLoading}
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all border active:scale-90 shadow-xl",
                  isWishlisted
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-gray-700 border-gray-100 hover:border-rose-200 hover:text-rose-500",
                )}
              >
                <Heart
                  className={cn("w-6 h-6", isWishlisted && "fill-current")}
                />
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Livraison gratuite pour les commandes de plus de $200. Retours
              sous 30 jours.
            </p>

            {currentBlogPost && currentBlogPost.slug && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <Link
                  href={`/blog/${currentBlogPost.slug}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-linear-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all border border-amber-100/50"
                  target="_blank"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">
                      Découvrir
                    </p>
                    <h4 className="font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
                      {currentBlogPost.title}
                    </h4>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
