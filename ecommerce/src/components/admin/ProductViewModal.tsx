"use client";

import { Product } from "@/types/admin";
import { formatPrice } from "@/lib/formatPrice";
import { Maximize2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductViewModal({
  product,
  isOpen,
  onClose,
}: ProductViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!product) return null;

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
              Détails du Produit
            </DialogTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all border-2 border-purple-500"
                title={isFullscreen ? "Réduire" : "Plein écran"}
              >
                <Maximize2 className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all border-2 border-purple-500"
                title="Fermer"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 ${isFullscreen ? "flex-1 overflow-y-auto" : ""}`}
        >
          {/* Image Gallery Section */}
          <div className="space-y-3">
            {/* Main Image */}
            <div
              className={`relative w-full ${isFullscreen ? "aspect-video" : "aspect-square"} bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center`}
            >
              {product.images && product.images[selectedImageIndex] ? (
                <>
                  <img
                    src={product.images[selectedImageIndex].url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  {/* Image Attributes Overlay */}
                  {(product.images[selectedImageIndex].color ||
                    (product.images[selectedImageIndex].sizes &&
                      product.images[selectedImageIndex].sizes.length > 0)) && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {product.images[selectedImageIndex].color && (
                        <Badge
                          variant="secondary"
                          className="bg-white/90 shadow-sm"
                        >
                          {product.images[selectedImageIndex].color}
                        </Badge>
                      )}
                      {product.images[selectedImageIndex].sizes &&
                        product.images[selectedImageIndex].sizes.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="bg-white/90 shadow-sm"
                          >
                            {product.images[selectedImageIndex].sizes.join(
                              ", "
                            )}
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

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square bg-gray-50 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      index === selectedImageIndex
                        ? "border-indigo-600 ring-2 ring-indigo-100"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Vue ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Name and Reference */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Réf: {product.reference}
              </p>
            </div>

            {/* Category */}
            {/* Brand and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marque
                </label>
                {product.brand ? (
                  <span className="text-gray-900 font-medium">
                    {product.brand}
                  </span>
                ) : (
                  <span className="text-gray-400 italic text-sm">
                    Non renseignée
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                {product.category ? (
                  <Badge variant="secondary" className="text-sm">
                    {product.category.name}
                  </Badge>
                ) : (
                  <span className="text-gray-400 italic text-sm">
                    Non classé
                  </span>
                )}
              </div>
            </div>

            {/* Colors and Sizes */}
            {((product.colors && product.colors.length > 0) ||
              (product.sizes && product.sizes.length > 0)) && (
              <div className="grid grid-cols-2 gap-4">
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleurs
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => {
                        const isAvailable =
                          product.images[selectedImageIndex]?.color === color;
                        return (
                          <Badge
                            key={color}
                            variant="outline"
                            className={
                              isAvailable ? "border-pink-500 border-2" : ""
                            }
                          >
                            {color}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tailles
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => {
                        const isAvailable =
                          product.images[selectedImageIndex]?.sizes?.includes(
                            size
                          ) || false;
                        return (
                          <Badge
                            key={size}
                            variant="outline"
                            className={
                              isAvailable ? "border-purple-500 border-2" : ""
                            }
                          >
                            {size}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Product Types */}
            {(product.isNew || product.isPromotion || product.isBestSeller) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labels
                </label>
                <div className="flex gap-2">
                  {product.isNew && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                      Nouveau
                    </Badge>
                  )}
                  {product.isPromotion && (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
                      Promotion
                    </Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                      Best-seller
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix
                </label>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <Badge
                  variant={product.stock > 0 ? "outline" : "destructive"}
                  className={
                    product.stock > 0
                      ? "bg-green-50 text-green-700 border-green-200 text-lg px-4 py-1"
                      : "text-lg px-4 py-1"
                  }
                >
                  {product.stock} unité{product.stock > 1 ? "s" : ""}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {product.description}
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nombre d&rsquo;images:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {product.images?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Statut:</span>
                  <Badge
                    variant={product.stock > 0 ? "outline" : "destructive"}
                    className={
                      product.stock > 0
                        ? "ml-2 bg-green-50 text-green-700 border-green-200"
                        : "ml-2"
                    }
                  >
                    {product.stock > 0 ? "En stock" : "Rupture"}
                  </Badge>
                </div>
                {product.rating !== undefined && (
                  <div>
                    <span className="text-gray-500">Note:</span>
                    <span className="ml-2 font-medium text-gray-900 flex items-center gap-1 inline-flex">
                      {product.rating}/5
                      <span className="text-yellow-400">★</span>
                      {product.reviewCount !== undefined && (
                        <span className="text-gray-400 text-xs">
                          ({product.reviewCount} avis)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
