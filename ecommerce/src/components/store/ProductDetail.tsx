"use client";

import Image from "next/image";
import {
  Star,
  Check,
  AlertCircle,
  ShoppingCart,
  Heart,
  BookOpen,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
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

interface ProductVariation {
  id: number;
  sku: string;
  color: string | null;
  size: string | null;
  price: number;
  oldPrice: number | null;
  stock: number;
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
  variations: ProductVariation[];
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
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const checkUserAndWishlist = async () => {
      try {
        // First check if user is logged in via a 200-returning endpoint
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          const user = authData.user;

          if (user) {
            setIsLoggedIn(true);
            // Only fetch wishlist if we know we are logged in
            const wishlistRes = await fetch("/api/customer/wishlist");
            if (wishlistRes.ok) {
              const wishlist = await wishlistRes.json();
              const isInWishlist = wishlist.some(
                (item: { productId: number }) => item.productId === product.id,
              );
              setIsWishlisted(isInWishlist);
            }
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch {
        // Silently handle check failure
        setIsLoggedIn(false);
      }
    };

    if (product?.id) {
      checkUserAndWishlist();
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

  // Filter variations by current color
  const colorVariations = useMemo(() => {
    if (!currentImage?.color) return [];
    return product.variations.filter(v => v.color === currentImage.color);
  }, [product.variations, currentImage.color]);

  const displayPrice = useMemo(() => {
    if (selectedSize && colorVariations.length > 0) {
      const variant = colorVariations.find(v => v.size === selectedSize);
      return variant
        ? Number(variant.price)
        : (currentImage?.price ?? product?.price);
    }
    return currentImage?.price ?? product?.price;
  }, [selectedSize, colorVariations, currentImage?.price, product?.price]);

  const displayOldPrice = useMemo(() => {
    if (selectedSize && colorVariations.length > 0) {
      const variant = colorVariations.find(v => v.size === selectedSize);
      return variant
        ? variant.oldPrice
          ? Number(variant.oldPrice)
          : null
        : (currentImage?.oldPrice ?? product?.oldPrice);
    }
    return currentImage?.oldPrice ?? product?.oldPrice;
  }, [
    selectedSize,
    colorVariations,
    currentImage?.oldPrice,
    product?.oldPrice,
  ]);

  const uniqueColors = product?.colors || [];

  const currentRef = useMemo(() => {
    if (selectedSize && colorVariations.length > 0) {
      const variant = colorVariations.find(v => v.size === selectedSize);
      return variant?.sku ?? currentImage?.reference ?? product?.reference;
    }
    return currentImage?.reference ?? product?.reference;
  }, [
    selectedSize,
    colorVariations,
    currentImage?.reference,
    product?.reference,
  ]);

  const availableSizes = useMemo(() => {
    if (colorVariations.length > 0) {
      return colorVariations.map(v => v.size).filter(Boolean) as string[];
    }
    return currentImage?.sizes && currentImage.sizes.length > 0
      ? currentImage.sizes
      : product?.sizes || [];
  }, [colorVariations, currentImage, product?.sizes]);

  const displayStock = useMemo(() => {
    // 1. If we have a specific size selected, get that variant's stock
    if (selectedSize && colorVariations.length > 0) {
      const variant = colorVariations.find(v => v.size === selectedSize);
      return variant ? variant.stock : 0;
    }

    // 2. If no size selected but we have color variations, return sum of their stocks
    if (colorVariations.length > 0) {
      return colorVariations.reduce((acc, v) => acc + (v.stock || 0), 0);
    }

    // 3. Fallback to image stock or product stock
    return currentImage?.stock ?? product?.stock ?? 0;
  }, [selectedSize, colorVariations, currentImage, product?.stock]);

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

  const addItem = useCartStore(state => state.addItem);
  const cartItems = useCartStore(state => state.items);

  // Optimistic stock calculation: subtract quantity already in cart
  const reactiveStock = useMemo(() => {
    const targetColor = currentImage?.color || null;
    const targetSize = selectedSize || null;

    const itemsMatchingSelection = cartItems.filter(item => {
      if (item.productId !== product.id) return false;

      const itemColor = item.color || null;
      if (itemColor !== targetColor) return false;

      if (targetSize !== null) {
        return (item.size || null) === targetSize;
      }
      return true; // No size selected: sum all sizes of this color
    });

    const inCartQuantity = itemsMatchingSelection.reduce(
      (acc, item) => acc + item.quantity,
      0,
    );
    return Math.max(0, displayStock - inCartQuantity);
  }, [displayStock, cartItems, product.id, currentImage?.color, selectedSize]);

  // Global reactive stock (all variations sum minus all items in cart)
  const globalReactiveStock = useMemo(() => {
    const physicalTotal =
      product.variations.length > 0
        ? product.variations.reduce((acc, v) => acc + (v.stock || 0), 0)
        : product.images.reduce((acc, img) => acc + (img.stock || 0), 0) ||
          product.stock;

    const inCartTotal = cartItems
      .filter(item => item.productId === product.id)
      .reduce((acc, item) => acc + item.quantity, 0);

    return Math.max(0, physicalTotal - inCartTotal);
  }, [product, cartItems]);

  // Live remaining stock (Physical - Cart - Current Quantity)
  const liveRemainingStock = useMemo(
    () => Math.max(0, reactiveStock - quantity),
    [reactiveStock, quantity],
  );
  const liveGlobalRemainingStock = useMemo(
    () => Math.max(0, globalReactiveStock - quantity),
    [globalReactiveStock, quantity],
  );

  // Animated states
  const [animatedStock, setAnimatedStock] = useState(liveRemainingStock);
  const [animatedGlobalStock, setAnimatedGlobalStock] = useState(
    liveGlobalRemainingStock,
  );
  const stockRef = useRef(liveRemainingStock);
  const globalStockRef = useRef(liveGlobalRemainingStock);

  useEffect(() => {
    const obj = { val: stockRef.current };
    anime({
      targets: obj,
      val: liveRemainingStock,
      round: 1,
      duration: 600,
      easing: "easeOutExpo",
      update: () => {
        setAnimatedStock(obj.val);
        stockRef.current = obj.val;
      },
    });
  }, [liveRemainingStock]);

  useEffect(() => {
    const obj = { val: globalStockRef.current };
    anime({
      targets: obj,
      val: liveGlobalRemainingStock,
      round: 1,
      duration: 600,
      easing: "easeOutExpo",
      update: () => {
        setAnimatedGlobalStock(obj.val);
        globalStockRef.current = obj.val;
      },
    });
  }, [liveGlobalRemainingStock]);

  // Adjust quantity if it exceeds reactive stock
  useEffect(() => {
    if (quantity > reactiveStock && reactiveStock > 0) {
      setQuantity(reactiveStock);
    } else if (reactiveStock === 0 && quantity > 1) {
      setQuantity(1);
    }
  }, [reactiveStock, quantity]);

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
    blogPosts.find(bp => bp.productImageId === currentImage?.id) ||
    blogPosts.find(bp => !bp.productImageId);

  return (
    <section className="py-4 md:py-8 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_420px] gap-8 md:gap-12 items-start">
        {}
        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">
          {/* Global Stock Display above gallery */}
          <div className="col-span-1 md:col-span-2 flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/40 border border-border rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Stock Total:{" "}
                <span className="text-foreground">{animatedGlobalStock}</span>{" "}
                unités
              </span>
            </div>
          </div>
          {}
          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible order-2 md:order-1">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                onClick={() => setSelectedImageIndex(i)}
                className={cn(
                  "relative shrink-0 w-16 h-16 md:w-full md:h-auto md:aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all",
                  selectedImageIndex === i
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-transparent hover:border-border",
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
          <div className="product-image-container opacity-0 relative bg-muted rounded-3xl aspect-3/4 md:aspect-4/5 max-h-[450px] md:max-h-[500px] overflow-hidden order-1 md:order-2 group mx-auto w-full md:w-[95%] shadow-2xl shadow-black/5">
            {currentImage?.url ? (
              <Image
                src={currentImage.url}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground font-bold text-xl">
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

            {/* Reactive Stock Badge on main image */}
            <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
              <div
                className={cn(
                  "px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md shadow-lg border",
                  globalReactiveStock < 5
                    ? "bg-orange-500/90 text-white border-orange-400"
                    : "bg-black/60 text-white border-white/20",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    globalReactiveStock < 5
                      ? "bg-background animate-pulse"
                      : "bg-green-400",
                  )}
                />
                <span className="text-[10px] font-black uppercase tracking-tight">
                  {animatedGlobalStock} Dispos
                </span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="product-info-stagger flex flex-col gap-8">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground font-medium mb-2 block uppercase tracking-wide">
                {product.category?.name || "Boutique"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Ref: {currentRef}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black mb-3 text-foreground tracking-tight leading-tight">
              {product.name}
            </h1>

            {!isLoggedIn && (
              <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900 mb-0.5">
                    Mode visiteur
                  </p>
                  <p className="text-amber-700 leading-normal">
                    Vous n&apos;êtes pas encore connecté.{" "}
                    <Link
                      href="/login"
                      className="font-black underline hover:text-amber-900 transition-colors"
                    >
                      Connectez-vous
                    </Link>{" "}
                    pour acheter cet article.
                  </p>
                </div>
              </div>
            )}

            {}
            {/* Price and Rating Row */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-end gap-3">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  ${displayPrice?.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-muted-foreground line-through text-lg mb-1">
                    ${displayOldPrice?.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4 fill-current",
                        i < Math.round(product.rating || 0)
                          ? "text-amber-500"
                          : "text-muted",
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  ({product.reviewCount || 0})
                </span>
              </div>
            </div>

            {}
            <div className="h-px bg-border my-2" />

            {}
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {product.description || "Aucune description disponible."}
            </p>

            <div className="grid gap-4 mb-6">
              {/* Color Selector */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-foreground text-sm">
                    Couleur:{" "}
                    <span className="font-normal text-muted-foreground">
                      {currentImage?.color || "Standard"}
                    </span>
                  </h3>
                </div>
                <div className="flex gap-2">
                  {uniqueColors.length > 0 ? (
                    uniqueColors.map((color: string) => {
                      const isSelected = currentImage?.color === color;
                      const index = images.findIndex(
                        img => img.color === color,
                      );
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedImageIndex(index)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all p-0.5 relative",
                            isSelected
                              ? "border-primary ring-1 ring-primary"
                              : "border-border hover:border-muted-foreground",
                          )}
                          title={color}
                        >
                          <span
                            className="block w-full h-full rounded-full border border-black/5 shadow-inner"
                            style={{ background: COLOR_MAP[color] || color }}
                          />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Aucune variante couleur
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-foreground text-sm">
                    Taille:{" "}
                    <span className="font-normal text-muted-foreground">
                      {selectedSize || "Sélectionnez"}
                    </span>
                  </h3>
                  <button className="text-xs text-foreground underline">
                    Guide des tailles
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.length > 0 ? (
                    availableSizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "h-12 min-w-12 px-4 rounded-lg border font-medium flex items-center justify-center transition-all",
                          selectedSize === size
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
                        )}
                      >
                        {size}
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Taille unique
                    </span>
                  )}
                </div>
              </div>
            </div>

            {}
            <div className="mb-6">
              {reactiveStock > 0 ? (
                <div className="flex flex-col gap-2">
                  <div
                    className={cn(
                      "flex items-center text-sm font-medium gap-2 p-3 rounded-xl w-fit transition-colors duration-500",
                      reactiveStock < 5
                        ? "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/50"
                        : "bg-green-50 text-green-600 border border-green-100 dark:bg-green-950/30 dark:border-green-900/50",
                    )}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span
                        className={cn(
                          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                          reactiveStock < 5 ? "bg-orange-400" : "bg-green-400",
                        )}
                      ></span>
                      <span
                        className={cn(
                          "relative inline-flex rounded-full h-2.5 w-2.5",
                          reactiveStock < 5 ? "bg-orange-500" : "bg-green-500",
                        )}
                      ></span>
                    </span>
                    <span className="stock-counter-wrapper inline-flex items-center gap-1">
                      En Stock (
                      <span className="font-black text-base min-w-[1.2rem] text-center">
                        {animatedStock}
                      </span>{" "}
                      restants après sélection)
                    </span>
                  </div>
                  {availableSizes.length > 0 && !selectedSize && (
                    <p className="text-[10px] text-muted-foreground font-medium italic">
                      * Sélectionnez une taille pour voir le stock précis
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-red-600 text-sm font-medium gap-2 p-3 bg-red-50 rounded-xl border border-red-100 w-fit dark:bg-red-950/30 dark:border-red-900/50">
                  <AlertCircle className="w-4 h-4" />
                  Rupture de stock
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex border border-border bg-muted/40 backdrop-blur-sm rounded-2xl items-center p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={reactiveStock <= 0}
                  className="w-12 h-12 hover:bg-background rounded-xl transition-all font-black text-xl disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                >
                  -
                </button>
                <span className="w-10 text-center font-black text-lg text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(reactiveStock, quantity + 1))
                  }
                  disabled={reactiveStock <= 0 || quantity >= reactiveStock}
                  className="w-12 h-12 hover:bg-background rounded-xl transition-all font-black text-xl disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                >
                  +
                </button>
              </div>

              <button
                onClick={
                  isLoggedIn
                    ? handleAddToCart
                    : () => (window.location.href = "/login")
                }
                disabled={displayStock <= 0}
                className={cn(
                  "flex-1 py-5 rounded-2xl font-black text-sm md:text-lg flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] whitespace-nowrap px-6",
                  displayStock > 0
                    ? isLoggedIn
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--btn-shadow)]"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                {isLoggedIn ? (
                  <ShoppingCart className="w-6 h-6 shrink-0" />
                ) : (
                  <User className="w-6 h-6 shrink-0" />
                )}
                {displayStock > 0
                  ? isLoggedIn
                    ? "Ajouter au panier"
                    : "Se connecter"
                  : "Indisponible"}
              </button>

              <button
                onClick={toggleWishlist}
                disabled={isWishlistLoading}
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all border active:scale-90 shadow-xl",
                  isWishlisted
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-background text-foreground border-border hover:border-rose-200 hover:text-rose-500",
                )}
              >
                <Heart
                  className={cn("w-6 h-6", isWishlisted && "fill-current")}
                />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Livraison gratuite pour les commandes de plus de $200. Retours
              sous 30 jours.
            </p>

            {currentBlogPost && currentBlogPost.slug && (
              <div className="mt-8 pt-8 border-t border-border">
                <Link
                  href={`/blog/${currentBlogPost.slug}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-linear-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all border border-amber-100/50"
                  target="_blank"
                >
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
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
