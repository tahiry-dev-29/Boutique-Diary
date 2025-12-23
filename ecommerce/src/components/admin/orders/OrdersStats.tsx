"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface OrderStats {
  totalOrdersToday: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  todayTrend: number;
  completedTrend: number;
  pendingTrend: number;
  cancelledTrend: number;
}

interface OrdersStatsProps {
  stats: OrderStats;
  loading?: boolean;
}

export function OrdersStats({ stats, loading }: OrdersStatsProps) {
  const statCards = [
    {
      label: "Total Orders Today",
      value: stats.totalOrdersToday,
      trend: stats.todayTrend,
      icon: ShoppingCart,
      color: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-500/10 text-blue-500",
      chartColor: "#3b82f6",
    },
    {
      label: "Order Completed",
      value: stats.completedOrders,
      trend: stats.completedTrend,
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/10 text-emerald-500",
      chartColor: "#10b981",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      trend: stats.pendingTrend,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-500/10 text-amber-500",
      chartColor: "#f59e0b",
    },
    {
      label: "Cancel Orders",
      value: stats.cancelledOrders,
      trend: stats.cancelledTrend,
      icon: XCircle,
      color: "from-rose-500 to-red-600",
      iconBg: "bg-rose-500/10 text-rose-500",
      chartColor: "#ef4444",
    },
  ];

  const Sparkline = ({ color, trend }: { color: string; trend: number }) => {
    const points =
      trend > 0
        ? "0,20 10,18 20,15 30,17 40,12 50,14 60,8 70,10 80,5"
        : "0,5 10,8 20,12 30,10 40,15 50,13 60,18 70,16 80,20";

    return (
      <svg width="80" height="24" className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const isPositiveTrend = stat.trend > 0;

        return (
          <Card
            key={index}
            className="relative overflow-hidden border-none shadow-sm bg-gray-100 dark:bg-gray-800 hover:translate-y-[-1px] transition-all duration-300 group border border-gray-100 dark:border-gray-700/50 py-6"
          >
            {}
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.06] dark:opacity-[0.10] blur-2xl rounded-bl-full -mr-5 -mt-5 transition-transform group-hover:scale-105`}
            />

            <CardContent className="relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col justify-between h-full space-y-2">
                  <div className="space-y-1">
                    <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate max-w-[120px]">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {loading ? "..." : stat.value.toLocaleString()}
                      </h3>
                      <div
                        className={`flex items-center gap-0.5 text-[11px] font-bold ${
                          isPositiveTrend ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {isPositiveTrend ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(stat.trend)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                    Last Month
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Sparkline color={stat.chartColor} trend={stat.trend} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default OrdersStats;
