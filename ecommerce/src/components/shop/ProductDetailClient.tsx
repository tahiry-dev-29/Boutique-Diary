"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/formatPrice";
import { useCartStore } from "@/lib/cart-store";
import {
  Minus,
  Plus,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ProductImage {
  id: number; // Added for variant tracking
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
  reviewCount?: number | null;
  brand?: string | null;
  category?: { name: string } | null;
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
    Silver: "#c0c0c0",
    "Space Gray": "#4a4a4a",
    Midnight: "#1a1a2e",
    Starlight: "#f5f5dc",
  };
  return map[colorName] || colorName;
};

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCartStore();

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
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const selectedImageIndex = product.images.findIndex(
    img => img.url === selectedImage,
  );
  const currentImage =
    selectedImageIndex !== -1 ? product.images[selectedImageIndex] : null;

  const currentStock =
    currentImage?.stock !== undefined && currentImage?.stock !== null
      ? currentImage.stock
      : product.stock;

  const selectImageAndSyncStock = (imgUrl: string) => {
    setSelectedImage(imgUrl);

    const img = product.images.find(i => i.url === imgUrl);
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
    setQuantity(prev => Math.max(1, Math.min(prev + delta, currentStock)));
  };

  // Calculate discount and totals
  const discountPercent =
    currentOldPrice && currentOldPrice > currentPrice
      ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
      : 0;
  const discountAmount =
    currentOldPrice && currentOldPrice > currentPrice
      ? (currentOldPrice - currentPrice) * quantity
      : 0;
  const subtotal = currentPrice * quantity;
  const deliveryFee = 15000; // Fixed delivery fee in MGA

  // Handle add to cart
  const handleAddToCart = () => {
    setIsAddingToCart(true);

    addItem({
      productId: product.id,
      productImageId: currentImage?.id, // Track specific variant
      name: product.name,
      reference: product.reference,
      image: getImageUrl(selectedImage),
      price: currentPrice,
      quantity: quantity,
      maxStock: currentStock,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    });

    setTimeout(() => setIsAddingToCart(false), 500);
  };

  // Handle buy now
  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="dark:bg-gray-900/50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <a href="/" className="hover:text-foreground">
            Accueil
          </a>
          <span>/</span>
          {product.category && (
            <>
              <a
                href={`/shop?category=${product.category.name}`}
                className="hover:text-foreground"
              >
                {product.category.name}
              </a>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {}
          <div className="lg:col-span-5">
            <div className="flex gap-4">
              {}
              {product.images.length > 1 && (
                <div className="flex flex-col gap-3 w-20">
                  {product.images.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        selectImageAndSyncStock(img.url);
                        if (img.color) setSelectedColor(img.color);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img.url
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-muted-foreground"
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
              <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
                <Image
                  src={getImageUrl(selectedImage)}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
                {product.isPromotion && discountPercent > 0 && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                    -{discountPercent}% OFF
                  </Badge>
                )}
                {product.isNew && (
                  <Badge className="absolute top-4 right-4 bg-emerald-500 text-white">
                    NEW
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-4 space-y-6">
            {}
            <div>
              {product.brand && (
                <span className="text-sm font-medium text-primary mb-1 block">
                  {product.brand}
                </span>
              )}
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {product.name}
              </h1>

              {}
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={16}
                        fill={
                          star <= product.rating! ? "#f59e0b" : "transparent"
                        }
                        className={
                          star <= product.rating!
                            ? "text-amber-500"
                            : "text-muted"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} Ratings
                  </span>
                  {product.reviewCount && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {product.reviewCount}+ Vendu
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {}
            {product.colors.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground mb-3 block">
                  Choisir Couleur
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => {
                    const colorCode = getColorCode(color);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          const imageWithColor = product.images.find(
                            img => img.color === color,
                          );
                          if (imageWithColor) {
                            selectImageAndSyncStock(imageWithColor.url);
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: colorCode }}
                        />
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {}
            {product.sizes.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground mb-3 block">
                  Choisir Taille
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => {
                    const isAvailable = currentImage?.sizes?.length
                      ? currentImage.sizes.includes(size)
                      : true;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : isAvailable
                              ? "border-border hover:border-muted-foreground"
                              : "border-border bg-muted text-muted-foreground cursor-not-allowed"
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
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(currentPrice)}
              </span>
              <span className="text-sm text-muted-foreground">ou 99€/mois</span>
            </div>

            {}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">A propos</TabsTrigger>
                <TabsTrigger value="reviews">Avis</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Marque:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {product.brand || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Couleur:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {selectedColor || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Catégorie:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {product.category?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Référence:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {product.reference}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground block mb-2">
                    Description:
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description || "Aucune description disponible."}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Aucun avis pour le moment.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {}
          <div className="lg:col-span-3">
            <div className="sticky top-24 dark:bg-gray-800 border border-border rounded-2xl p-6 space-y-6">
              {}
              {product.isPromotion && discountPercent > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                  <span className="text-sm font-bold text-primary">
                    {discountPercent}% OFF
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Offre limitée
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-foreground">
                Détails de commande
              </h3>

              {}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quantité</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center hover:bg-accent disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentStock}
                    className="w-10 h-10 flex items-center justify-center hover:bg-accent disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Couleur</span>
                  <span className="font-medium">{selectedColor || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taille</span>
                  <span className="font-medium">{selectedSize || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix</span>
                  <span className="font-medium">
                    {formatPrice(currentOldPrice || currentPrice)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Remise ({discountPercent}%)</span>
                    <span className="font-medium">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck size={14} /> Livraison
                  </span>
                  <span className="font-medium">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {}
              <div className="flex justify-between items-center">
                <span className="text-foreground font-semibold">
                  Sous-total
                </span>
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  Acheter maintenant
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full py-4 rounded-xl font-bold text-foreground border-2 border-border hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  {isAddingToCart ? (
                    <>
                      <Check size={18} className="text-emerald-500" />
                      Ajouté!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Ajouter au panier
                    </>
                  )}
                </button>
              </div>

              {}
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground pt-4 border-t border-border">
                <div className="flex flex-col items-center gap-1">
                  <Truck size={16} />
                  <span>Livraison rapide</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw size={16} />
                  <span>Retour 7j</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck size={16} />
                  <span>Garantie 1 an</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
