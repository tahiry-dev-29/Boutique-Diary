"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CreditCard, Smartphone } from "lucide-react";

export type PaymentMethod = "mvola" | "orange_money" | "airtel_money" | "card";

interface PaymentMethodsProps {
  selected: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  mvolaPhone: string;
  onMvolaPhoneChange: (phone: string) => void;
  mvolaName: string;
  onMvolaNameChange: (name: string) => void;
}

export default function PaymentMethods({
  selected,
  onChange,
  mvolaPhone,
  onMvolaPhoneChange,
  mvolaName,
  onMvolaNameChange,
}: PaymentMethodsProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-xl text-foreground">Moyen de paiement</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {}
        <button
          type="button"
          onClick={() => onChange("mvola")}
          className={cn(
            "relative p-4 rounded-xl border-2 text-left transition-all duration-300 flex items-center gap-4",
            selected === "mvola"
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50",
          )}
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-foreground">MVola</p>
            <p className="text-xs text-muted-foreground">
              Paiement mobile instantané
            </p>
          </div>
          {selected === "mvola" && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full ring-2 ring-background" />
          )}
        </button>

        {}
        <button
          type="button"
          onClick={() => onChange("card")}
          className={cn(
            "relative p-4 rounded-xl border-2 text-left transition-all duration-300 flex items-center gap-4",
            selected === "card"
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50",
          )}
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-foreground">Carte Bancaire</p>
            <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
          </div>
          {selected === "card" && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full ring-2 ring-background" />
          )}
        </button>
      </div>

      {}
      {selected === "mvola" && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-secondary/5 border border-border rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">
                  Confirmation Mobile
                </h4>
                <p className="text-sm text-muted-foreground">
                  Après avoir cliqué sur &quot;Payer&quot;, vous recevrez une
                  notification sur votre téléphone pour valider la transaction
                  avec votre code secret.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-muted-foreground">
                Nom complet du titulaire
              </label>
              <input
                type="text"
                value={mvolaName}
                onChange={e => onMvolaNameChange(e.target.value)}
                placeholder="Ex: RAKOTO Jean"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-muted-foreground">
                Numéro MVola à débiter
              </label>
              <input
                type="tel"
                value={mvolaPhone}
                onChange={e => onMvolaPhoneChange(e.target.value)}
                placeholder="Ex: 034 12 345 67"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
              />
            </div>
          </div>
        </div>
      )}

      {}
      {selected === "card" && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-secondary/5 border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
            <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm border border-border">
              <CreditCard className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Le formulaire de carte bancaire sécurisé (Stripe/PCI-DSS) sera
              chargé ici.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
