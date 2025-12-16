"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore, formatPrice, CartItem } from "@/lib/cart-store";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItemCard = ({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) => {
  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product image */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-semibold text-foreground text-lg truncate">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Réf: {item.reference}
              </p>
              {(item.color || item.size) && (
                <div className="flex gap-2 mt-1">
                  {item.color && (
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.color}
                    </span>
                  )}
                  {item.size && (
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.size}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              {/* Quantity controls */}
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="p-2 text-foreground hover:bg-accent transition-colors rounded-l-lg"
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium text-foreground">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-2 text-foreground hover:bg-accent transition-colors rounded-r-lg"
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Price */}
              <p className="font-bold text-lg text-foreground">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors self-start"
            aria-label="Supprimer l'article"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } =
    useCartStore();

  const subtotal = getSubtotal();
  const shipping = subtotal > 50 * 4500 ? 0 : 15000; // Free shipping over 50€ (~225000 MGA)
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Votre panier est vide
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Vous n&apos;avez encore rien ajouté à votre panier. Découvrez nos
            produits et commencez votre shopping !
          </p>
          <Button asChild size="lg">
            <Link href="/shop">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Découvrir la boutique
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/shop"
          className="p-2 rounded-full hover:bg-accent transition-colors text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Mon Panier
        </h1>
        <span className="text-muted-foreground">
          ({items.length} article{items.length > 1 ? "s" : ""})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}

          {/* Clear cart button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={clearCart}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vider le panier
            </Button>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Résumé de la commande
              </h2>

              {/* Promo code */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Code promo
                </label>
                <div className="flex gap-2">
                  <Input placeholder="Entrez votre code" className="flex-1" />
                  <Button variant="outline">Appliquer</Button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="text-foreground">
                    {shipping === 0 ? (
                      <span className="text-emerald-500 font-medium">
                        Gratuite
                      </span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Livraison gratuite à partir de {formatPrice(50 * 4500)}
                  </p>
                )}
                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout button */}
              <Button asChild className="w-full mt-6" size="lg">
                <Link href="/checkout">Passer la commande</Link>
              </Button>

              {/* Continue shopping */}
              <Button asChild variant="ghost" className="w-full mt-2">
                <Link href="/shop">Continuer mes achats</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
