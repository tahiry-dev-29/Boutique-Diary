"use client";

import { Product } from "@/types/admin";
import { formatPrice } from "@/lib/formatPrice";
import {
  Maximize2,
  X,
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ShopProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShopProductModal({
  product,
  isOpen,
  onClose,
}: ShopProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : null,
  );

  if (!product) return null;

  const currentImage = product.images?.[selectedImageIndex];

  const currentPrice =
    currentImage && typeof currentImage === "object" && currentImage.price
      ? currentImage.price
      : product.price;

  const currentOldPrice =
    currentImage &&
    typeof currentImage === "object" &&
    currentImage.oldPrice !== undefined &&
    currentImage.oldPrice !== null
      ? currentImage.oldPrice
      : product.oldPrice;

  const currentStock =
    currentImage &&
    typeof currentImage === "object" &&
    currentImage.stock !== undefined &&
    currentImage.stock !== null
      ? currentImage.stock
      : product.stock;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newValue = prev + delta;
      return newValue >= 1 && newValue <= currentStock ? newValue : prev;
    });
  };

  const handleAddToCart = () => {
    console.log("Adding to cart:", {
      productId: product.id,
      quantity,
      selectedImage: currentImage,
      selectedSize,
      price: currentPrice,
    });

    onClose();
  };

  const handleBuyNow = () => {
    console.log("Buying now:", {
      productId: product.id,
      quantity,
      selectedImage: currentImage,
      selectedSize,
      price: currentPrice,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={
          isFullscreen
            ? "max-w-full w-screen h-screen m-0 p-6 flex flex-col"
            : "max-w-4xl max-h-[90vh] overflow-y-auto"
        }
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {product.name}
            </DialogTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all border-2 border-transparent hover:border-gray-200"
                title={isFullscreen ? "Réduire" : "Plein écran"}
              >
                <Maximize2 className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all border-2 border-transparent hover:border-gray-200"
                title="Fermer"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 ${isFullscreen ? "flex-1 overflow-y-auto" : ""}`}
        >
          {}
          <div className="space-y-4">
            {}
            <div
              className={`relative w-full ${isFullscreen ? "aspect-video" : "aspect-square"} bg-white border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm`}
            >
              {product.images && product.images[selectedImageIndex] ? (
                <>
                  <img
                    src={
                      typeof currentImage === "object"
                        ? currentImage.url
                        : currentImage
                    }
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                  />

                  {}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNew && (
                      <Badge className="bg-blue-500 text-white">Nouveau</Badge>
                    )}
                    {product.isPromotion && (
                      <Badge className="bg-rose-500 text-white">Promo</Badge>
                    )}
                    {product.isPromotion &&
                      product.oldPrice &&
                      product.oldPrice > product.price && (
                        <Badge className="bg-rose-100 text-rose-600 border border-rose-200">
                          -
                          {Math.round(
                            ((product.oldPrice - product.price) /
                              product.oldPrice) *
                              100,
                          )}
                          %
                        </Badge>
                      )}
                  </div>

                  {}
                  {typeof currentImage === "object" &&
                    (currentImage.color || currentImage.sizes) && (
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        {currentImage.color && (
                          <Badge
                            variant="secondary"
                            className="bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 text-gray-800"
                          >
                            {currentImage.color}
                          </Badge>
                        )}
                      </div>
                    )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <span className="text-sm">Aucune image</span>
                </div>
              )}
            </div>

            {}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square bg-gray-50 border-2 rounded-lg overflow-hidden transition-all ${
                      index === selectedImageIndex
                        ? "border-rose-500 ring-2 ring-rose-100 opacity-100"
                        : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={typeof img === "object" ? img.url : img}
                      alt={`Vue ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="flex flex-col h-full space-y-6">
            {}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                  {product.reference}
                </span>
                {product.rating != null && product.rating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-sm font-bold text-gray-800">
                      {product.rating}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({product.reviewCount})
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h3>

              {}
              <div className="flex flex-wrap gap-2 mt-3">
                {product.brand && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.brand}
                  </span>
                )}
                {product.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.category.name}
                  </span>
                )}
              </div>
            </div>

            {}
            <div className="py-4 border-y border-gray-100">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                {product.isPromotion && (
                  <div className="flex flex-col items-start mb-2">
                    <span className="text-sm text-rose-500 font-medium px-2 py-0.5 bg-rose-50 rounded mb-1">
                      Prix Spécial
                    </span>
                    {currentOldPrice && currentOldPrice > currentPrice && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                        -
                        {Math.round(
                          ((currentOldPrice - currentPrice) / currentOldPrice) *
                            100,
                        )}
                        %
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center text-sm">
                <div
                  className={`flex items-center gap-2 ${currentStock > 0 ? "text-green-600" : "text-red-500"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${currentStock > 0 ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="font-medium">
                    {currentStock > 0
                      ? `En stock (${currentStock} disponibles)`
                      : "Rupture de stock"}
                  </span>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-6">
              {}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Couleurs disponibles
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                          // Simple highlighting if current image matches
                          typeof currentImage === "object" &&
                          currentImage.color === color
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="block text-sm font-medium text-gray-700">
                      Taille
                    </span>
                    <span className="text-xs text-rose-600 cursor-pointer hover:underline">
                      Guide des tailles
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] h-10 flex items-center justify-center text-sm font-medium rounded-lg border transition-all ${
                          selectedSize === size
                            ? "border-rose-500 bg-rose-50 text-rose-700 ring-1 ring-rose-500"
                            : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {}
            <div className="mt-auto space-y-4 pt-6">
              {}
              <div className="flex items-center gap-4">
                <div className="w-32 flex items-center justify-between border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-semibold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentStock}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Total:{" "}
                  <span className="font-bold text-gray-900">
                    {formatPrice(currentPrice * quantity)}
                  </span>
                </span>
              </div>

              {}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-12 text-base font-medium border-2 hover:bg-gray-50"
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Ajouter au panier
                </Button>
                <Button
                  className="h-12 text-base font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
                  onClick={handleBuyNow}
                  disabled={currentStock === 0}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Acheter maintenant
                </Button>
              </div>
            </div>

            {}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description ||
                  "Aucune description disponible pour ce produit."}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
