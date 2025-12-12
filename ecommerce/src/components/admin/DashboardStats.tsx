import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Percent,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Product } from "@/types/admin";

interface DashboardStatsProps {
  products: Product[];
}

export function DashboardStats({ products }: DashboardStatsProps) {
  // Calculate real stats where possible
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValue = products.reduce(
    (acc, p) => acc + p.price * (p.stock || 0),
    0,
  );

  const inStockCount = products.filter(p => {
    const stock =
      p.stock ||
      p.images?.reduce(
        (acc, img) => acc + (typeof img === "string" ? 0 : img.stock || 0),
        0,
      ) ||
      0;
    return stock > 0;
  }).length;
  const outOfStockCount = totalProducts - inStockCount;

  const stats = [
    {
      label: "Valeur du Stock",
      value: new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "MGA",
      }).format(totalValue),
      subValue: "Valeur totale estimée",
      change: null, // No trend
      trend: "neutral",
      icon: DollarSign,
    },
    {
      label: "Total Produits",
      value: totalProducts.toLocaleString(),
      subValue: "Références catalogue",
      change: null,
      trend: "neutral",
      icon: ShoppingBag,
    },
    {
      label: "En Stock",
      value: inStockCount.toLocaleString(),
      subValue: "Produits disponibles",
      change: `${Math.round((inStockCount / (totalProducts || 1)) * 100)}%`, // Real percentage
      trend: "up",
      icon: Users, // Could swap icon
    },
    {
      label: "Rupture de Stock",
      value: outOfStockCount.toLocaleString(), // Real
      subValue: "À réapprovisionner",
      change: `${Math.round((outOfStockCount / (totalProducts || 1)) * 100)}%`,
      trend: "down",
      icon: Percent, // Could swap icon
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-none shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] bg-white dark:bg-gray-800 rounded-2xl hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)] transition-all duration-300"
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {stat.value}
                </h3>
              </div>
              {stat.change && (
                <div
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                    stat.trend === "up"
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {stat.change}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {stat.subValue}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
