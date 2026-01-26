"use client";

import { useState } from "react";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { AppliedPromo } from "@/components/checkout/PromoCodeInput";

export default function CheckoutPage() {
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Continuer mes achats</span>
          </Link>
          <h1 className="text-lg font-bold font-heading text-foreground">
            Paiement
          </h1>
          <div className="w-[100px]" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
              <CheckoutForm
                appliedPromo={appliedPromo}
                onPromoApplied={setAppliedPromo}
              />
            </div>

            {/* Summary */}
            <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
              <OrderSummary appliedPromo={appliedPromo} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
