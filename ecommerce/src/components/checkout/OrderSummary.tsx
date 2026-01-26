import { useCartStore, formatPrice } from "@/lib/cart-store";
import Image from "next/image";
import { ShoppingBag, Tag } from "lucide-react";
import type { AppliedPromo } from "@/components/checkout/PromoCodeInput";

interface OrderSummaryProps {
  appliedPromo?: AppliedPromo | null;
}

export default function OrderSummary({ appliedPromo }: OrderSummaryProps) {
  const items = useCartStore(state => state.items);
  const getSubtotal = useCartStore(state => state.getSubtotal);

  const subtotal = getSubtotal();
  const delivery = 0;

  // 1. Calculate Per-Item Discount
  let totalDiscount = 0;
  const itemDiscounts = items.map(item => {
    const itemTotal = item.price * item.quantity;
    let discount = 0;

    if (appliedPromo) {
      if (appliedPromo.type === "PERCENTAGE") {
        discount = Math.floor(itemTotal * (appliedPromo.value / 100));
      } else {
        // Pro-rate Fixed Amount: (ItemSubtotal / TotalSubtotal) * FixedAmount
        // Using Math.round to ensure total sum matches fixed amount
        discount = Math.round((itemTotal / subtotal) * appliedPromo.value);
      }
    }

    totalDiscount += discount;
    return { id: item.id, amount: discount };
  });

  const taxes = Math.round((subtotal - totalDiscount) * 0.2);
  const total = subtotal + delivery + taxes - totalDiscount;

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
      <h3 className="font-bold text-xl mb-6 font-heading">Récapitulatif</h3>

      {/* Items list */}
      <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item, idx) => {
          const itemDiscount = itemDiscounts[idx].amount;
          const itemTotal = item.price * item.quantity;
          const hasDiscount = itemDiscount > 0;

          return (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-20 bg-card rounded-xl relative overflow-hidden shrink-0 border border-border/50 group">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                    No Img
                  </div>
                )}
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-bl-lg font-black">
                  x{item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-foreground truncate">
                  {item.name}
                </h4>
                <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight mt-0.5">
                  {item.size} {item.color && `• ${item.color}`}
                </p>
                <div className="flex flex-col mt-1">
                  {hasDiscount ? (
                    <>
                      <span className="text-xs text-muted-foreground line-through decoration-rose-500/50">
                        {formatPrice(itemTotal)}
                      </span>
                      <span className="text-sm font-black text-primary">
                        {formatPrice(itemTotal - itemDiscount)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(itemTotal)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="space-y-4 border-t border-border/60 pt-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">Sous-total</span>
          <span className="font-bold">{formatPrice(subtotal)}</span>
        </div>

        {/* Global Promo summary */}
        {totalDiscount > 0 && (
          <div className="flex justify-between items-center text-sm p-3 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-1">
            <span className="flex items-center gap-2 font-bold text-primary">
              <Tag className="w-4 h-4" />
              Promotion ({appliedPromo?.code})
            </span>
            <span className="font-black text-primary">
              -{formatPrice(totalDiscount)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">Livraison</span>
          <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">
            Gratuite
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">Taxes (20%)</span>
          <span className="font-bold">{formatPrice(taxes)}</span>
        </div>
        <div className="flex justify-between text-xl font-black pt-6 border-t border-border mt-4">
          <span className="font-heading">Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
