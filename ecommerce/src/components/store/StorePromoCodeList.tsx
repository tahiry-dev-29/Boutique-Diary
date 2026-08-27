"use client";

import type { PromoCode } from "@/generated/prisma/client";
import { Copy, Check, Ticket, Clock, Percent, Banknote } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StorePromoCodeListProps {
  promos: PromoCode[];
}

export default function StorePromoCodeList({
  promos,
}: StorePromoCodeListProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copié !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!promos || promos.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map(promo => (
          <div
            key={promo.id}
            className="relative group bg-white border border-dashed border-gray-300 rounded-3xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 p-8 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Ticket className="w-24 h-24 -rotate-12 text-indigo-600" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                      promo.type === "PERCENTAGE"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    {promo.type === "PERCENTAGE"
                      ? "Réduction %"
                      : "Réduction Fixe"}
                  </span>
                  {promo.endDate && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      Fin: {new Date(promo.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">
                    {promo.type === "PERCENTAGE"
                      ? `-${promo.value}%`
                      : `-${promo.value.toLocaleString()} Ar`}
                  </span>
                </div>

                <p className="text-sm font-medium text-gray-500 mb-8 line-clamp-2 leading-relaxed">
                  Offre exclusive limitée. Profitez-en dès maintenant sur toute
                  la boutique.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-2xl border border-gray-200 group-hover:bg-white group-hover:border-indigo-200 transition-colors shadow-inner">
                <div className="flex-1 font-mono font-black text-xl text-center tracking-[0.2em] text-indigo-600 border-r border-gray-300 border-dashed pr-2 uppercase">
                  {promo.code}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(promo.code, promo.id)}
                  className={cn(
                    "shrink-0 h-10 w-10 rounded-xl transition-all",
                    copiedId === promo.id
                      ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                      : "hover:bg-indigo-50 hover:text-indigo-600",
                  )}
                >
                  {copiedId === promo.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
