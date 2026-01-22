"use client";

import { useCartStore, formatPrice } from "@/lib/cart-store";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

export default function OrderSummary() {
  const items = useCartStore(state => state.items);
  const getSubtotal = useCartStore(state => state.getSubtotal);

  const subtotal = getSubtotal();
  const delivery = 0;
  const taxes = subtotal * 0.2;
  const total = subtotal + delivery + taxes;

  if (items.length === 0) {
    return (
      <div className="bg-secondary/5 rounded-3xl p-8 text-center text-foreground">
        <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
          <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <p className="text-muted-foreground font-medium">
          Votre panier est vide
        </p>
      </div>
    );
  }

  return (
    <div className="bg-secondary/5 rounded-3xl p-6 lg:p-8 sticky top-8 text-foreground">
      <h3 className="font-bold text-xl mb-6">Récapitulatif</h3>

      {}
      <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map(item => (
          <div key={item.id} className="flex gap-4">
            <div className="w-16 h-20 bg-card rounded-lg relative overflow-hidden shrink-0 border border-border">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                  No Img
                </div>
              )}
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg font-bold">
                x{item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">
                {item.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {item.size} {item.color && `• ${item.color}`}
              </p>
              <p className="text-sm font-bold text-foreground mt-1">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="space-y-3 border-t border-border pt-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Livraison</span>
          <span className="text-primary font-medium">Gratuite</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxes (20%)</span>
          <span className="font-medium">{formatPrice(taxes)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-4 border-t border-border mt-4">
          <span>Total à payer</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
