"use client";

import React from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useFetchSalesData } from "@/features/reports/hooks/use-fetch-sales-data";
import { KpiCard } from "@/features/reports/components/SalesReports/KpiCards";
import { RevenueChart } from "@/features/reports/components/SalesReports/RevenueChart";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalesReportsPage() {
  const { data, loading, error } = useFetchSalesData();

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Erreur
        </h2>
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  const { summary, chartData: rawChartData } = data || {
    summary: null,
    chartData: [],
  };

  // Transform daily sales for sparkline (API returns { date, amount, orders, aov })
  const revenueChartData = (rawChartData || []).map(d => ({ value: d.amount }));
  const ordersChartData = (rawChartData || []).map(d => ({ value: d.orders }));
  const aovChartData = (rawChartData || []).map(d => ({ value: d.aov }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Rapports des Ventes"
        description="Analysez les performances financières et les tendances de vente."
      />

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Revenu Total"
          value={new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "MGA",
            maximumFractionDigits: 0,
          }).format(summary?.totalRevenue || 0)}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          subValue="vs. mois dernier"
          chartData={revenueChartData}
          color="#10b981" // Emerald
        />
        <KpiCard
          title="Commandes"
          value={(summary?.totalOrders || 0).toString()}
          icon={ShoppingCart}
          trend="up"
          trendValue="+5.2%"
          chartData={ordersChartData}
          chartType="bar"
          color="#3b82f6" // Blue
        />
        <KpiCard
          title="Panier Moyen"
          value={new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "MGA",
            maximumFractionDigits: 0,
          }).format(summary?.averageOrderValue || 0)}
          icon={TrendingUp}
          trend="down"
          trendValue="-2.1%"
          chartData={aovChartData}
          color="#f59e0b" // Amber
        />
        <KpiCard
          title="Taux de Conversion"
          value={`${summary?.conversionRate || 0}%`}
          icon={TrendingUp}
          trend="neutral"
          subValue="Visiteurs vs Commandes"
          chartData={revenueChartData} // Reusing for consistency
          color="#8b5cf6" // Purple
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-100 dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Évolution du Revenu (30 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <RevenueChart data={rawChartData} />
          </CardContent>
        </Card>

        {/* Placeholder for Breakdown or Top Products list - Phase 2 */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-100 dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p>Plus de détails bientôt disponibles...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
