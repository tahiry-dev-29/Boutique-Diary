"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  RefreshCcw,
  Loader2,
} from "lucide-react";

export default function CustomerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customer/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    const s = status.toUpperCase();
    if (s === "DELIVERED" || s === "COMPLETED")
      return <CheckCircle className="text-green-500" size={20} />;
    if (s === "SHIPPED") return <Truck className="text-blue-500" size={20} />;
    if (s === "PROCESSING" || s === "PENDING")
      return <Clock className="text-yellow-500" size={20} />;
    return <Package className="text-muted-foreground" size={20} />;
  };

  const getStatusClass = (status: string) => {
    const s = status.toUpperCase();
    if (s === "DELIVERED" || s === "COMPLETED")
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (s === "SHIPPED")
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (s === "PROCESSING" || s === "PENDING")
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes commandes</h1>
          <p className="text-muted-foreground mt-1">
            Suivez l&apos;état de vos commandes
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors text-sm font-medium"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCcw size={16} />
          )}
          Actualiser
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && orders.length === 0 ? (
          <div className="py-12 flex justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div
              key={order.id}
              className="dark:border-gray-700/50 border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-muted/50">
                <div className="flex items-center gap-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-semibold text-foreground">
                      {order.reference}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="p-4 space-y-3">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.product?.name || "Produit inconnu"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">
                      {item.price.toFixed(2)} Ar
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">
                  {order.total.toFixed(2)} Ar
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">
              Aucune commande trouvée.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
