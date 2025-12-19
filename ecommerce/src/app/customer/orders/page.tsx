"use client";

import React from "react";
import { Package, Truck, CheckCircle, Clock, RefreshCcw } from "lucide-react";

const orders = [
  {
    id: "ORD-2024-001",
    date: "10 Décembre 2024",
    status: "delivered",
    statusLabel: "Livré",
    total: 89.9,
    items: [
      { name: "T-Shirt Premium", qty: 2, price: 29.9 },
      { name: "Pantalon Slim", qty: 1, price: 49.9 },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "5 Décembre 2024",
    status: "shipping",
    statusLabel: "En livraison",
    total: 45.0,
    items: [{ name: "Chemise Lin", qty: 1, price: 45.0 }],
  },
  {
    id: "ORD-2024-003",
    date: "28 Novembre 2024",
    status: "processing",
    statusLabel: "En préparation",
    total: 120.5,
    items: [
      { name: "Veste Cuir", qty: 1, price: 99.5 },
      { name: "Ceinture", qty: 1, price: 21.0 },
    ],
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="text-green-500" size={20} />;
    case "shipping":
      return <Truck className="text-blue-500" size={20} />;
    case "processing":
      return <Clock className="text-yellow-500" size={20} />;
    default:
      return <Package className="text-muted-foreground" size={20} />;
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "shipping":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "processing":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function CustomerOrders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes commandes</h1>
          <p className="text-muted-foreground mt-1">
            Suivez l&apos;état de vos commandes
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors text-sm font-medium">
          <RefreshCcw size={16} />
          Actualiser
        </button>
      </div>

      {}
      <div className="space-y-4">
        {orders.map(order => (
          <div
            key={order.id}
            className="dark:border-gray-700/50 border border-border rounded-xl overflow-hidden"
          >
            {}
            <div className="flex items-center justify-between p-4 bg-muted/50">
              <div className="flex items-center gap-4">
                {getStatusIcon(order.status)}
                <div>
                  <p className="font-semibold text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}
              >
                {order.statusLabel}
              </span>
            </div>

            {}
            <div className="p-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Quantité: {item.qty}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">
                    {item.price.toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>

            {}
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">
                {order.total.toFixed(2)} €
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
