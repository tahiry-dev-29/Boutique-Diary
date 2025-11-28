"use client";

import { Product } from "@/types/admin";
import { formatPrice } from "@/lib/formatPrice";
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

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Détails du Produit
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full aspect-square bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
              {product.images && product.images[selectedImageIndex] ? (
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <span className="text-sm">Aucune image</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
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
                      src={img}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              {product.category ? (
                <Badge variant="secondary" className="text-sm">
                  {product.category.name}
                </Badge>
              ) : (
                <span className="text-gray-400 italic text-sm">Non classé</span>
              )}
            </div>

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
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
