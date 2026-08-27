"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  CreditCard,
  ArrowRight,
  Settings,
  List,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import StatsCard from "@/components/admin/dashboard/StatsCard";
import { formatPrice } from "@/lib/utils";

/** Response shape from the transactions endpoint. */
interface TransactionsResponse {
  transactions: Array<{ status: string; amount: number }>;
  pagination: { total: number };
}

/** Aggregated payment dashboard statistics. */
interface PaymentStats {
  totalRevenue: number;
  transactionCount: number;
  pendingCount: number;
  activeMethods: number;
}

/** Derives dashboard KPIs from raw API data. */
function deriveStats(
  txData: TransactionsResponse | undefined,
  methodsData: Array<{ isActive: boolean }> | undefined,
): PaymentStats {
  const txs = txData?.transactions ?? [];
  const totalRevenue = txs
    .filter(t => t.status === "SUCCESS")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingCount = txs.filter(t => t.status === "PENDING").length;
  const activeMethods = methodsData?.filter(m => m.isActive).length ?? 0;

  return {
    totalRevenue,
    transactionCount: txData?.pagination?.total ?? txs.length,
    pendingCount,
    activeMethods,
  };
}

export default function PaymentDashboardPage() {
  const {
    data: txData,
    isLoading: txLoading,
    mutate: mutateTx,
  } = useSWR<TransactionsResponse>(
    "/api/admin/payments/transactions?limit=100",
    fetcher,
    { revalidateOnFocus: true },
  );

  const { data: methodsData, isLoading: methodsLoading } = useSWR<
    Array<{ isActive: boolean }>
  >("/api/admin/payments/methods", fetcher, { revalidateOnFocus: true });

  const loading = txLoading || methodsLoading;
  const stats = deriveStats(txData, methodsData);

  /** SSE listener refreshes dashboard stats on real-time events. */
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream?role=admin");

    eventSource.onmessage = event => {
      try {
        if (event.data.startsWith("{")) {
          const data = JSON.parse(event.data);
          if (
            data.type === "TRANSACTION_UPDATE" ||
            data.type === "TRANSACTION_BULK_UPDATE" ||
            data.type === "ORDER_UPDATE"
          ) {
            mutateTx();
          }
        }
      } catch {
        /* heartbeat — ignore */
      }
    };

    return () => eventSource.close();
  }, [mutateTx]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Gestion des Paiements"
        description="Configurez vos passerelles de paiement et suivez vos revenus en temps réel."
        onRefresh={() => mutateTx()}
        isLoading={loading}
      />

      {/* Quick statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg flex flex-col justify-between h-[140px] border border-white/10 transition-transform hover:scale-[1.02]">
          <div className="p-2 bg-white/20 rounded-xl w-fit">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
              Revenu Total (Transactions)
            </p>
            <h3 className="text-2xl font-bold mt-1">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                formatPrice(stats.totalRevenue)
              )}
            </h3>
          </div>
        </div>

        <StatsCard
          title="Transactions"
          value={loading ? "..." : stats.transactionCount}
          icon={List}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />

        <StatsCard
          title="En attente"
          value={loading ? "..." : stats.pendingCount}
          icon={Clock}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
        />

        <StatsCard
          title="Modes Actifs"
          value={loading ? "..." : stats.activeMethods}
          icon={CreditCard}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Payment methods configuration card */}
        <Card className="group border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden relative transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-500">
            <Settings size={160} />
          </div>
          <CardHeader className="pb-2">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl w-fit mb-4">
              <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Modes de Paiement
            </CardTitle>
            <CardDescription className="text-base">
              Activez et configurez vos passerelles de paiement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 py-2">
              <p className="text-gray-500 dark:text-gray-400">
                Gérez comment vos clients vous paient. Configurez les solutions
                locales comme MVola, Orange Money ou Airtel Money.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">MVola</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-sm font-medium">Orange Money</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">Airtel Money</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/admin/payment/methods" className="w-full">
              <Button className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md hover:shadow-indigo-500/20">
                Gérer les méthodes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Transactions history card */}
        <Card className="group border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden relative transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-500">
            <List size={160} />
          </div>
          <CardHeader className="pb-2">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl w-fit mb-4">
              <List className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Historique Transactions
            </CardTitle>
            <CardDescription className="text-base">
              Consultez tous les paiements et remboursements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 py-2">
              <p className="text-gray-500 dark:text-gray-400">
                Suivez l&apos;état de chaque paiement, filtrez par date ou par
                client, et exportez vos données comptables.
              </p>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Dernière transaction
                </span>
                <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm font-bold text-emerald-600">
                  Récemment
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/admin/payment/transactions" className="w-full">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all"
              >
                Voir l&apos;historique
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
