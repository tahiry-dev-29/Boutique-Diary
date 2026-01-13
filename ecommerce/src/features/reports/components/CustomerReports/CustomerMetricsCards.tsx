import React from "react";
import { CustomerMetric } from "../../types/customers";
import { KpiCard } from "../SalesReports/KpiCards";
import { Users, UserPlus, UserCheck } from "lucide-react";

interface CustomerMetricsCardsProps {
  metrics: CustomerMetric;
  recentSignups?: { date: string; count: number }[];
}

export function CustomerMetricsCards({
  metrics,
  recentSignups = [],
}: CustomerMetricsCardsProps) {
  const newCustomersChartData = recentSignups.map((d) => ({ value: d.count }));

  const customersChartData: any[] = [];
  const activeChartData: any[] = [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KpiCard
        title="Total Clients"
        value={metrics.totalCustomers.toLocaleString()}
        icon={Users}
        subValue="Base client totale"
        chartData={customersChartData}
        color="#3b82f6"
      />
      <KpiCard
        title="Nouveaux Clients (30j)"
        value={metrics.newCustomers.toLocaleString()}
        icon={UserPlus}
        trend="neutral"
        subValue="Derniers 30 jours"
        chartData={newCustomersChartData}
        chartType="bar"
        color="#10b981"
      />
      <KpiCard
        title="Clients Actifs"
        value={metrics.activeCustomers.toLocaleString()}
        icon={UserCheck}
        trend="neutral"
        subValue="Compte non bloqué"
        chartData={activeChartData}
        color="#f59e0b"
      />
    </div>
  );
}
