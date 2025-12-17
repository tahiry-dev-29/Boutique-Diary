"use client";

import { X, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  // Mock Cart Data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "Badacore Tshirt",
      variant: "Oversize",
      size: "XL",
      color: "Cream",
      price: 90.0,
      quantity: 1,
      image: "", // Add placeholder logic
    },
    {
      id: 2,
      title: "Brown Bomber",
      variant: "Windbreaker",
      size: "L",
      color: "Brown",
      price: 52.0,
      quantity: 2,
      image: "",
    },
    {
      id: 3,
      title: "Long Tshirt Massive",
      variant: "Long Sleeve",
      size: "XL",
      color: "Dark Grey",
      price: 95.0,
      quantity: 1,
      image: "",
    },
  ]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const delivery = 0; // Free
  const taxes = 21.0;
  const total = subtotal + delivery + taxes;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-white z-[70] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {cartItems.map(item => (
            <div key={item.id} className="flex gap-6">
              {/* Product Image */}
              <div className="w-24 h-32 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                {/* Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                  Image
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                      <p>Variant : {item.variant}</p>
                      <p>Size : {item.size}</p>
                      <p>Color : {item.color}</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="flex gap-4">
                    <button className="text-gray-400 hover:text-black transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-black transition-colors">
                      <span className="sr-only">Like</span>♡
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-black transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-medium w-4 text-center">
                      {item.quantity}
                    </span>
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-black transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer (Summary & Checkout) */}
        <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100">
          <h3 className="font-bold text-xl mb-6">Summary</h3>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                Subtotal (?)
              </span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                Estimated Delivery & Handling
              </span>
              <span className="font-bold">
                {delivery === 0 ? "Free" : `$${delivery}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                Estimated Taxes (?)
              </span>
              <span className="font-bold">${taxes.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xl font-bold mb-6 border-t border-gray-200 pt-4">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-colors">
              Checkout Now
            </button>
            <button className="w-full bg-white border border-gray-300 text-black py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <span className="text-blue-600 font-bold italic">Pay</span>
              <span className="text-blue-400 font-bold italic">Pal</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
