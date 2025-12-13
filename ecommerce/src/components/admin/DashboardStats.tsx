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
      icon: percent => <Percent {...percent} />,
      iconComponent: Percent,
      color: "from-rose-500 to-red-600",
      iconBg: "bg-rose-500/10 text-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon || stat.iconComponent;
        return (
          <Card
            key={index}
            className="relative overflow-hidden border-none shadow-md bg-white dark:bg-gray-800 hover:translate-y-[-1px] transition-all duration-300 group border border-gray-100 dark:border-gray-700"
          >
            {/* Background glowing effect */}
            <div
              className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${stat.color} opacity-[0.08] dark:opacity-[0.12] blur-3xl rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110`}
            />

            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col justify-between h-full space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      {stat.label}
                    </p>
                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {stat.value}
                    </h3>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                    {stat.subValue}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div
                    className={`p-3 rounded-xl ${stat.iconBg} shadow-sm flex items-center justify-center bg-opacity-10`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {stat.change && (
                    <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600">
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
