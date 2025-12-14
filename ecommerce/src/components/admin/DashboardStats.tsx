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
      p.images?.reduce(
        (acc, img) => acc + (typeof img === "string" ? 0 : img.stock || 0),
        0,
      ) || 0;
    return stock > 0;
  }).length;
  const outOfStockCount = totalProducts - inStockCount;

  const stats = [
    {
      label: "Valeur du Stock",
      value: new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "MGA",
        maximumFractionDigits: 0,
      }).format(totalValue),
      subValue: "Valeur totale estimée",
      change: null,
      trend: "neutral",
      icon: DollarSign,
      color: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Total Produits",
      value: totalProducts.toLocaleString(),
      subValue: "Références catalogue",
      change: null,
      trend: "neutral",
      icon: ShoppingBag,
      color: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-500/10 text-purple-500",
    },
    {
      label: "En Stock",
      value: inStockCount.toLocaleString(),
      subValue: "Produits disponibles",
      change: `${Math.round((inStockCount / (totalProducts || 1)) * 100)}%`,
      trend: "neutral",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/10 text-emerald-500",
    },
    {
      label: "Rupture de Stock",
      value: outOfStockCount.toLocaleString(),
      subValue: "À réapprovisionner",
      change: `${Math.round((outOfStockCount / (totalProducts || 1)) * 100)}%`,
      trend: "neutral",
      icon: Percent,
      color: "from-rose-500 to-red-600",
      iconBg: "bg-rose-500/10 text-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="relative overflow-hidden border-none shadow-sm bg-gray-100 dark:bg-gray-800 hover:translate-y-[-1px] transition-all duration-300 group border border-gray-100 dark:border-gray-700/50"
          >
            {/* Background glowing effect */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.06] dark:opacity-[0.10] blur-2xl rounded-bl-full -mr-5 -mt-5 transition-transform group-hover:scale-105`}
            />

            <CardContent className="p-5 relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col justify-between h-full space-y-2">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {stat.value}
                    </h3>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                    {stat.subValue}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`p-2.5 rounded-xl ${stat.iconBg} shadow-sm flex items-center justify-center bg-opacity-10`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {stat.change && (
                    <div className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600/50">
                      {stat.change}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
