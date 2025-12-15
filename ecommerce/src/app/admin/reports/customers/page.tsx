"use client";

import React from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useFetchCustomerReports } from "@/features/reports/hooks/use-fetch-customer-reports";
import { CustomerMetricsCards } from "@/features/reports/components/CustomerReports/CustomerMetricsCards";
import { CustomerGrowthChart } from "@/features/reports/components/CustomerReports/CustomerGrowthChart";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CustomerReportsPage() {
  const { data, loading, error } = useFetchCustomerReports();

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

  const metrics = data?.metrics || {
    totalCustomers: 0,
    newCustomers: 0,
    activeCustomers: 0,
  };
  const topCustomers = data?.topCustomers || [];
  const recentSignups = data?.recentSignups || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Rapports Clients"
        description="Analysez votre base de clients et leur comportement d'achat."
      />

      {/* KPI Section */}
      <CustomerMetricsCards metrics={metrics} recentSignups={recentSignups} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-100 dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Nouveaux Inscrits (30 derniers jours)</CardTitle>
            <CardDescription>
              Évolution des inscriptions journalières
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <CustomerGrowthChart data={recentSignups} />
          </CardContent>
        </Card>

        {/* Top Customers Table */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-100 dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Top 5 Meilleurs Clients</CardTitle>
            <CardDescription>Par volume d&apos;achat total</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-gray-500">
                        {customer.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "MGA",
                        maximumFractionDigits: 0,
                      }).format(customer.totalSpent)}
                    </TableCell>
                  </TableRow>
                ))}
                {topCustomers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-4 text-gray-400"
                    >
                      Aucun client
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
