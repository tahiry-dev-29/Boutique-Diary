"use client";

import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, formatPrice } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  const subtotal = getSubtotal();
  const delivery = 0;
  const taxes = subtotal * 0.2;
  const total = subtotal + delivery + taxes;

  return (
    <>
      {}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {}
      <div
        className={cn(
          "fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-[480px] bg-white z-[70] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen ? "translate-x-0" : "translate-x-[110%]",
        )}
      >
        {}
        <div className="p-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mon Panier</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-lg font-medium">Votre panier est vide.</p>
              <button
                onClick={onClose}
                className="text-black font-bold underline hover:text-gray-600"
              >
                Continuer vos achats
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Order Summary
              </h3>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex gap-5 p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all duration-300"
                >
                  {}
                  <div className="w-20 h-24 bg-white rounded-xl shrink-0 relative overflow-hidden shadow-sm border border-gray-100">
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
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 leading-tight pr-4">
                          {item.name}
                        </h3>
                        <span className="font-bold text-gray-900 whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex gap-2">
                        {item.size && (
                          <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600">
                            {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>{" "}
                            {item.color}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white border border-gray-200 rounded-full px-1 py-1 shadow-sm">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-sm w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30"
                            disabled={item.quantity >= (item.maxStock || 999)}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                          x {formatPrice(item.price)}
                        </span>
                      </div>

                      {}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {}
        {items.length > 0 && (
          <div className="p-8 bg-gray-50/50 backdrop-blur-sm border-t rounded-b-[32px] border-gray-100">
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Sous-total</span>
                <span className="font-bold text-gray-900 text-lg">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Taxes & Livraison calculées à l'étape suivante</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center text-sm"
                onClick={onClose}
              >
                Voir le panier
              </Link>
              <Link
                href="/checkout"
                className="group w-full bg-black text-white px-4 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm"
                onClick={onClose}
              >
                <span>Commander</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
