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
      <h3 className="font-bold text-xl">Moyen de paiement</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {}
        <button
          type="button"
          onClick={() => onChange("mvola")}
          className={cn(
            "relative p-4 rounded-xl border-2 text-left transition-all duration-300 flex items-center gap-4",
            selected === "mvola"
              ? "border-yellow-400 bg-yellow-50/50"
              : "border-gray-100 bg-white hover:border-gray-200",
          )}
        >
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">MVola</p>
            <p className="text-xs text-gray-500">Paiement mobile instantané</p>
          </div>
          {selected === "mvola" && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-yellow-400 rounded-full ring-2 ring-white" />
          )}
        </button>

        {}
        <button
          type="button"
          onClick={() => onChange("card")}
          className={cn(
            "relative p-4 rounded-xl border-2 text-left transition-all duration-300 flex items-center gap-4",
            selected === "card"
              ? "border-black bg-gray-50"
              : "border-gray-100 bg-white hover:border-gray-200",
          )}
        >
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Carte Bancaire</p>
            <p className="text-xs text-gray-500">Visa, Mastercard</p>
          </div>
          {selected === "card" && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-black rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>

      {}
      {selected === "mvola" && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 text-yellow-700 font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">
                  Confirmation Mobile
                </h4>
                <p className="text-sm text-gray-600">
                  Après avoir cliqué sur &quot;Payer&quot;, vous recevrez une
                  notification sur votre téléphone pour valider la transaction
                  avec votre code secret.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Nom complet du titulaire
              </label>
              <input
                type="text"
                value={mvolaName}
                onChange={e => onMvolaNameChange(e.target.value)}
                placeholder="Ex: RAKOTO Jean"
                className="w-full px-4 py-3 rounded-xl border border-yellow-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Numéro MVola à débiter
              </label>
              <input
                type="tel"
                value={mvolaPhone}
                onChange={e => onMvolaPhoneChange(e.target.value)}
                placeholder="Ex: 034 12 345 67"
                className="w-full px-4 py-3 rounded-xl border border-yellow-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      )}

      {}
      {selected === "card" && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <CreditCard className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              Le formulaire de carte bancaire sécurisé (Stripe/PCI-DSS) sera
              chargé ici.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
