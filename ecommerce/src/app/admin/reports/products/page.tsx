"use client";

import React from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useFetchProductReports } from "@/features/reports/hooks/use-fetch-product-reports";
import { ProductPerformanceTable } from "@/features/reports/components/ProductsReports/ProductPerformanceTable";
import { StockDistributionChart } from "@/features/reports/components/ProductsReports/StockDistributionChart";
import { Package, AlertTriangle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/features/reports/components/SalesReports/KpiCards";

export default function ProductsReportsPage() {
  const { data, loading, error } = useFetchProductReports();

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
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

  const stockDistribution = data?.stockDistribution || [];
  const topProducts = data?.topProducts || [];
  const totalProducts = data?.totalProducts || 0;
  const totalValue = data?.totalValue || 0;

  // Calculate percentage out of stock
  const outOfStockCount =
    stockDistribution.find(d => d.status === "Out of Stock")?.count || 0;
  const outOfStockPercent =
    totalProducts > 0 ? Math.round((outOfStockCount / totalProducts) * 100) : 0;

  // No sparkline data available from API yet for products history
  const productsChartData: any[] = [];
  const valueChartData: any[] = [];
  const stockChartData: any[] = [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Rapports Produits"
        description="Analysez les performances des produits et l'état des stocks."
      />

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Total Produits"
          value={totalProducts.toLocaleString()}
          icon={Package}
          trend="neutral"
          chartData={productsChartData}
          color="#8b5cf6"
        />
        <KpiCard
          title="Valeur du Stock"
          value={new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "MGA",
            maximumFractionDigits: 0,
          }).format(totalValue)}
          icon={Package}
          subValue="Valeur estimée (Prix * Stock)"
          chartData={valueChartData}
          color="#10b981"
        />
        <KpiCard
          title="Rupture de Stock"
          value={`${outOfStockPercent}%`}
          icon={AlertTriangle}
          trend={outOfStockPercent > 10 ? "down" : "neutral"}
          trendValue={`${outOfStockCount} produits`}
          subValue="Attention requise"
          chartData={stockChartData}
          chartType="bar"
          color="#ef4444"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Chart */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-100 dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Distribution du Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <StockDistributionChart data={stockDistribution} />
            <div className="text-center mt-4 text-sm text-gray-500">
              Vue d&apos;ensemble de la disponibilité
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Table */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-100 dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Top 5 Meilleures Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <ProductPerformanceTable products={topProducts} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
