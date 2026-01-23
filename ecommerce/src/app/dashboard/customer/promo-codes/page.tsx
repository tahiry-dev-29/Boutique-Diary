"use client";

import { useState, useEffect } from "react";
import { Gift, Tag, Copy, Check, Loader2, Sparkles, Coins } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PromoShopItem {
  id: number;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount: number | null;
  expiresAt: string | null;
  purchasePrice?: number;
  description: string;
}

export default function PromoCodesPage() {
  const [availableCodes, setAvailableCodes] = useState<PromoShopItem[]>([]);
  const [myCodes, setMyCodes] = useState<PromoShopItem[]>([]);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch("/api/customer/promo-codes");
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points);
        setAvailableCodes(data.available);
        setMyCodes(data.owned);
      }
    } catch (error) {
      console.error("Failed to fetch promo codes:", error);
      toast.error("Erreur lors du chargement des codes");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (item: PromoShopItem) => {
    if (!item.purchasePrice || points < item.purchasePrice) return;
    setIsPurchasing(item.id);

    try {
      const res = await fetch("/api/customer/promo-codes/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCodeId: item.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'achat");

      toast.success("Code promo acheté avec succès !");
      setPoints(data.newPoints);
      // Move purchased code to myCodes (or just reload logic, simpler to push local)
      setMyCodes([data.promo, ...myCodes]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPurchasing(null);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Code copié !");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Points */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" />
            Mes Récompenses
          </h1>
          <p className="text-muted-foreground mt-2">
            Échangez vos points contre des réductions exclusives
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-3">
          <div className="bg-primary rounded-full p-2">
            <Coins className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Mon Solde
            </p>
            <p className="text-2xl font-black text-primary">
              {points.toLocaleString()} pts
            </p>
          </div>
        </div>
      </div>

      {/* My Codes Section */}
      {myCodes.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" /> Mes Codes Actifs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCodes.map(item => (
              <div
                key={item.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="bg-secondary/30 p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-black text-foreground">
                        {item.type === "PERCENTAGE"
                          ? `-${item.value}%`
                          : `-${item.value.toLocaleString("fr-FR")} Ar`}
                      </h3>
                      <span className="bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded-full font-bold">
                        Acquis
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>
                  </div>
                  <div className="bg-background rounded-xl p-3 flex items-center gap-2 border border-border/50">
                    <code className="flex-1 font-mono font-bold text-lg text-center text-primary">
                      {item.code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(item.code)}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        copiedCode === item.code
                          ? "bg-green-500 text-white"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {copiedCode === item.code ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Shop Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Boutique Cadeaux
        </h2>
        {availableCodes.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">
              Aucune offre disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCodes.map(item => {
              const canBuy = item.purchasePrice && points >= item.purchasePrice;
              return (
                <div
                  key={item.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col"
                >
                  <div className="bg-linear-to-br from-primary/5 to-transparent p-6 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      {item.type === "PERCENTAGE" ? (
                        <Tag className="w-6 h-6 text-primary" />
                      ) : (
                        <Gift className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-1">
                      {item.type === "PERCENTAGE"
                        ? `-${item.value}%`
                        : `-${item.value.toLocaleString("fr-FR")} Ar`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.minOrderAmount && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Min. commande:{" "}
                        {item.minOrderAmount.toLocaleString("fr-FR")} Ar
                      </p>
                    )}
                  </div>
                  <div className="p-4 border-t border-border bg-card/50">
                    <Button
                      className="w-full font-bold"
                      variant={canBuy ? "default" : "secondary"}
                      disabled={!canBuy || isPurchasing === item.id}
                      onClick={() => handlePurchase(item)}
                    >
                      {isPurchasing === item.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Coins className="w-4 h-4 mr-2" />
                      )}
                      {item.purchasePrice} pts
                    </Button>
                    {!canBuy && (
                      <p className="text-center text-xs text-destructive mt-2 font-medium">
                        Points insuffisants
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
