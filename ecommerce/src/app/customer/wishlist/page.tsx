"use client";

import React from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";

const wishlistItems = [
  {
    id: 1,
    name: "T-Shirt Premium Coton Bio",
    price: 29.9,
    originalPrice: 39.9,
    image: "/placeholder.png",
    inStock: true,
  },
  {
    id: 2,
    name: "Pantalon Chino Slim Fit",
    price: 59.9,
    originalPrice: null,
    image: "/placeholder.png",
    inStock: true,
  },
  {
    id: 3,
    name: "Veste en Cuir Vintage",
    price: 149.9,
    originalPrice: 199.9,
    image: "/placeholder.png",
    inStock: false,
  },
];

export default function CustomerWishlist() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="text-destructive" size={24} />
            Mes favoris
          </h1>
          <p className="text-muted-foreground mt-1">
            {wishlistItems.length} articles dans votre liste
          </p>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="dark:border-gray-700/50 border border-border rounded-xl p-12 text-center">
          <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground">
            Votre liste est vide
          </h2>
          <p className="text-muted-foreground mt-2 mb-6">
            Ajoutez des produits à vos favoris pour les retrouver ici
          </p>
          <a
            href="/shop"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Parcourir la boutique
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map(item => (
            <div
              key={item.id}
              className="dark:border-gray-700/50 border border-border rounded-xl overflow-hidden group"
            >
              {/* Image */}
              <div className="relative aspect-square bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                {!item.inStock && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Rupture de stock
                    </span>
                  </div>
                )}
                {/* Remove button */}
                <button className="absolute top-3 right-3 p-2 dark:border-gray-700/50 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-foreground line-clamp-2 mb-2">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-foreground">
                    {item.price.toFixed(2)} €
                  </span>
                  {item.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {item.originalPrice.toFixed(2)} €
                    </span>
                  )}
                </div>

                {/* Add to cart */}
                <button
                  disabled={!item.inStock}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${
                    item.inStock
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={18} />
                  {item.inStock ? "Ajouter au panier" : "Indisponible"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
