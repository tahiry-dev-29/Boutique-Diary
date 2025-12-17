"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  reference: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;

  
  getItemCount: () => number;
  getSubtotal: () => number;
}


const generateId = (item: Omit<CartItem, "id">) =>
  `${item.productId}-${item.color || "default"}-${item.size || "default"}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: item => {
        const id = generateId(item);
        const existingItem = get().items.find(i => i.id === id);

        if (existingItem) {
          
          set({
            items: get().items.map(i =>
              i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i,
            ),
          });
        } else {
          
          set({
            items: [...get().items, { ...item, id }],
          });
        }
        
        set({ isOpen: true });
      },

      removeItem: id => {
        set({
          items: get().items.filter(i => i.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map(i => (i.id === id ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      setOpen: open => {
        set({ isOpen: open });
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "boutique-diary-cart",
    },
  ),
);


export const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: "MGA",
    maximumFractionDigits: 0,
  }).format(amount);
};
