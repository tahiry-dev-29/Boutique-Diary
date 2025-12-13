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
            className="relative overflow-hidden border-none shadow-lg bg-[#1a1f37] dark:bg-[#1a1f37] hover:translate-y-[-2px] transition-all duration-300 group"
          >
            {/* Background glowing effect */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.15] blur-2xl rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}
            />

            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {stat.value}
                    </h3>
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    {stat.subValue}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div
                    className={`p-3 rounded-xl ${stat.iconBg} shadow-inner flex items-center justify-center backdrop-blur-md bg-opacity-20`}
                    style={{
                      boxShadow: "inset 0 0 10px rgba(255,255,255,0.05)",
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {stat.change && (
                    <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-[#1a1f37] border border-gray-700/50 text-white shadow-sm">
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
