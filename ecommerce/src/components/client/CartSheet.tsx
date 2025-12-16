"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore, formatPrice, CartItem } from "@/lib/cart-store";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItemRow = ({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) => {
  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      {/* Product image */}
      <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground truncate">
          {item.name}
        </h4>
        <p className="text-xs text-muted-foreground">Réf: {item.reference}</p>
        {(item.color || item.size) && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.color && <span>{item.color}</span>}
            {item.color && item.size && <span> / </span>}
            {item.size && <span>{item.size}</span>}
          </p>
        )}
        <p className="font-semibold text-sm text-foreground mt-1">
          {formatPrice(item.price)}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Supprimer"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1 bg-muted rounded-lg">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1.5 text-foreground hover:bg-accent rounded-l-lg transition-colors"
            aria-label="Diminuer la quantité"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-6 text-center text-sm font-medium text-foreground">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1.5 text-foreground hover:bg-accent rounded-r-lg transition-colors"
            aria-label="Augmenter la quantité"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CartSheet = () => {
  const { items, isOpen, setOpen, updateQuantity, removeItem, getSubtotal } =
    useCartStore();

  const subtotal = getSubtotal();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Mon Panier
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount} article{itemCount > 1 ? "s" : ""})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">
              Votre panier est vide
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Découvrez nos produits et ajoutez-les à votre panier
            </p>
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/shop">Voir la boutique</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-4 px-4">
              <div className="divide-y divide-border">
                {items.map(item => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="border-t border-border pt-4 flex-col gap-4">
              {/* Subtotal */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Livraison calculée à l&apos;étape suivante
                </p>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-2">
                <Button
                  asChild
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/checkout">Commander</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/cart">Voir le panier</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
