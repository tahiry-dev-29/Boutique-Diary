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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
    <section className="py-3 md:py-5 px-3 md:px-5">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.2fr_1fr] gap-5 lg:gap-8 items-start">
        {/* Left Column: Image Gallery (Sticky on Desktop) */}
        <div className="md:sticky md:top-20 grid grid-cols-1 md:grid-cols-[80px_1fr] gap-3">
          {/* Global Stock Display above gallery */}
          <div className="col-span-1 md:col-span-2 flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              <span className="text-[11px] font-black text-foreground/80 uppercase tracking-[0.15em]">
                Collection Exclusive —{" "}
                <span className="text-blue-400">{animatedGlobalStock}</span> en
                stock
              </span>
            </div>
          </div>
          {}
          {/* Thumbnails */}
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible order-2 md:order-1 no-scrollbar pb-2 md:pb-0">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                onClick={() => setSelectedImageIndex(i)}
                className={cn(
                  "relative shrink-0 w-16 h-16 md:w-full md:h-20 bg-card rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105",
                  selectedImageIndex === i
                    ? "border-primary shadow-md ring-1 ring-primary/20"
                    : "border-border/30 hover:border-primary/40",
                )}
              >
                {img.url && (
                  <Image
                    src={img.url}
                    alt={`${product.name} - View ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="order-1 md:order-2 product-image-container product-card-reveal opacity-0 relative aspect-[4/5] w-full overflow-hidden group shadow-md bg-card rounded-2xl">
            {currentImage?.url ? (
              <Image
                src={currentImage.url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground font-black text-2xl uppercase tracking-tighter">
                [Image Principale]
              </div>
            )}

            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-blue-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Nouveau
                </span>
              )}
              {hasDiscount && (
                <span className="bg-rose-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  -{discountPercent}%
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-amber-400/90 backdrop-blur-sm text-black text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Top Vente
                </span>
              )}
            </div>

            {/* Reactive Stock Badge on main image */}
            <div className="absolute bottom-4 right-4 animate-in fade-in zoom-in duration-500">
              <div
                className={cn(
                  "px-3 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-lg",
                  globalReactiveStock < 5
                    ? "bg-rose-500/80 text-white"
                    : "bg-black/50 text-white",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    globalReactiveStock < 5
                      ? "bg-white animate-pulse"
                      : "bg-emerald-400",
                  )}
                />
                <span className="text-xs font-bold">
                  {animatedGlobalStock} en stock
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Info */}
        <div className="product-info-stagger flex flex-col gap-4 pb-8">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-primary/40" />
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                  {product.category?.name || "Premium Selection"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                <span className="flex h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-600 uppercase">
                  En Stock
                </span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight">
              {product.name}
            </h1>

            {!isLoggedIn && (
              <div className="mb-3 p-2 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[10px]">
                  <p className="font-bold text-amber-900">
                    Mode visiteur —{" "}
                    <Link
                      href="/login"
                      className="underline hover:text-amber-700"
                    >
                      Connectez-vous
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {}
            {/* Price and Rating Row */}
            <div className="flex flex-wrap items-center gap-4 py-3 border-y border-border/40">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  ${displayPrice?.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground/60 line-through">
                    ${displayOldPrice?.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="h-6 w-px bg-border/40 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5",
                        i < Math.round(product.rating || 0)
                          ? "fill-current text-amber-500"
                          : "text-muted-foreground/20",
                      )}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  ({product.reviewCount || 0} avis)
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                Description
              </h3>
              <div className="relative">
                <p
                  className={cn(
                    "text-foreground/70 text-sm leading-relaxed transition-all duration-300",
                    !isDescriptionExpanded && "line-clamp-3",
                  )}
                >
                  {product.description || "Aucune description disponible."}
                </p>
                {product.description && product.description.length > 150 && (
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="text-xs font-bold text-primary hover:underline mt-1"
                  >
                    {isDescriptionExpanded ? "Voir moins" : "Voir plus"}
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-3 mb-4">
              {/* Color Selector */}
              <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-foreground text-[10px] uppercase tracking-widest">
                    Couleur
                  </h3>
                  <span className="text-[10px] font-medium text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                    {currentImage?.color || "Standard"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
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
                            "group relative w-9 h-9 rounded-full transition-all duration-200",
                            isSelected
                              ? "scale-110 ring-2 ring-primary ring-offset-2"
                              : "hover:scale-105",
                          )}
                          title={color}
                        >
                          <span
                            className="block w-full h-full rounded-full border border-black/10 shadow-sm"
                            style={{ background: COLOR_MAP[color] || color }}
                          />
                          {isSelected && (
                            <div className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground rounded-full p-0.5">
                              <Check className="w-2 h-2" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">
                      Couleur unique
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selector */}
              <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-foreground text-[10px] uppercase tracking-widest">
                    Taille
                  </h3>
                  <button className="text-[9px] font-bold text-primary hover:underline">
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
                          "h-10 min-w-[2.5rem] px-3 rounded-lg border font-bold transition-all duration-200 text-sm",
                          selectedSize === size
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "border-border/50 text-foreground/70 hover:border-primary/50 hover:text-primary",
                        )}
                      >
                        {size}
                      </button>
                    ))
                  ) : (
                    <div className="h-10 flex items-center px-4 rounded-lg bg-secondary/30 text-[10px] font-bold uppercase text-foreground/50">
                      Taille unique
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stock Level Indicator */}
            <div className="mb-3">
              {reactiveStock > 0 ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-emerald-500/5 border-emerald-200/50 text-emerald-600">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-bold">
                    {animatedStock} pièces disponibles
                  </span>
                  {availableSizes.length > 0 && !selectedSize && (
                    <span className="text-[9px] text-muted-foreground italic ml-1">
                      (sélectionnez une taille)
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-rose-500/5 rounded-xl border border-rose-200/50 text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-bold">Rupture de stock</span>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="flex flex-col gap-3">
              {/* Mobile: Counter + Heart on same row */}
              <div className="flex gap-2">
                <div className="flex border border-border/40 bg-card rounded-xl items-center p-1 flex-1 sm:flex-none sm:w-32 justify-between">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={reactiveStock <= 0}
                    className="w-9 h-9 hover:bg-secondary rounded-lg transition-all font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-lg text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(reactiveStock, quantity + 1))
                    }
                    disabled={reactiveStock <= 0 || quantity >= reactiveStock}
                    className="w-9 h-9 hover:bg-secondary rounded-lg transition-all font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={toggleWishlist}
                  disabled={isWishlistLoading}
                  className={cn(
                    "w-12 h-12 sm:hidden rounded-xl flex items-center justify-center transition-all border active:scale-90",
                    isWishlisted
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-card text-foreground border-border/50 hover:border-rose-300 hover:text-rose-500",
                  )}
                >
                  <Heart
                    className={cn("w-5 h-5", isWishlisted && "fill-current")}
                  />
                </button>
              </div>

              {/* Add to Cart + Heart (desktop) */}
              <div className="flex gap-2">
                <button
                  onClick={
                    isLoggedIn
                      ? handleAddToCart
                      : () => (window.location.href = "/login")
                  }
                  disabled={displayStock <= 0}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] px-6 shadow-md",
                    displayStock > 0
                      ? isLoggedIn
                        ? "btn-primary hover:shadow-lg"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {isLoggedIn ? (
                    <ShoppingCart className="w-5 h-5 shrink-0" />
                  ) : (
                    <User className="w-5 h-5 shrink-0" />
                  )}
                  {displayStock > 0
                    ? isLoggedIn
                      ? "Ajouter au Panier"
                      : "Se Connecter"
                    : "Épuisé"}
                </button>

                <button
                  onClick={toggleWishlist}
                  disabled={isWishlistLoading}
                  className={cn(
                    "hidden sm:flex w-12 h-12 rounded-xl items-center justify-center transition-all border active:scale-90",
                    isWishlisted
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-card text-foreground border-border/50 hover:border-rose-300 hover:text-rose-500",
                  )}
                >
                  <Heart
                    className={cn("w-5 h-5", isWishlisted && "fill-current")}
                  />
                </button>
              </div>

              {/* Trust Features Grid */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-border/40">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/20">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase text-foreground">
                      Livraison
                    </span>
                    <span className="text-[8px] font-medium text-muted-foreground">
                      Gratuite $200+
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/20">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase text-foreground">
                      Retours
                    </span>
                    <span className="text-[8px] font-medium text-muted-foreground">
                      Sous 30 Jours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {currentBlogPost && currentBlogPost.slug && (
              <div className="mt-3">
                <Link
                  href={`/blog/${currentBlogPost.slug}`}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all border border-border/40"
                  target="_blank"
                >
                  <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shadow-sm">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
                      Article Lié
                    </span>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
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
