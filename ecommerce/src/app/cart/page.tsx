"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useCartStore, formatPrice } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const getSubtotal = useCartStore(state => state.getSubtotal);

  const subtotal = getSubtotal();
  const delivery = 0;
  const taxes = subtotal * 0.2;
  const total = subtotal + delivery + taxes;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Votre panier est vide
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Il semblerait que vous n'ayez pas encore craqué pour nos produits.
            Découvrez notre collection dès maintenant !
          </p>
        </div>
        <Link
          href="/"
          className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mon Panier</h1>
            <span className="text-gray-500">{items.length} articles</span>
          </div>

          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="group relative flex gap-6 p-4 sm:p-6 rounded-3xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-300"
              >
                {}
                <div className="w-24 h-32 sm:w-32 sm:h-40 bg-gray-100 rounded-2xl shrink-0 relative overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                      No Img
                    </div>
                  )}
                </div>

                {}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                          {item.size && (
                            <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600">
                              {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg text-xs">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-lg text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    {}
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full px-1 py-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-sm w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all disabled:opacity-30"
                        disabled={item.quantity >= (item.maxStock || 999)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm font-medium px-3 py-2 rounded-xl hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="lg:w-[400px] shrink-0">
          <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Récapitulatif
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="font-medium text-green-600">Gratuite</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA (20%)</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(taxes)}
                </span>
              </div>
              <div className="h-px bg-gray-200 my-4" />
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
            >
              <span>Passer la commande</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-xs text-gray-400 text-center mt-4">
              Taxes et frais de livraison calculés à l'étape suivante
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
