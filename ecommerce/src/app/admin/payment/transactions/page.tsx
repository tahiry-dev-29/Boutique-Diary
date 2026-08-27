"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  Loader2,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/PageHeader";

/** Single transaction from the API. */
interface Transaction {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  reference: string;
  status: string;
  createdAt: string;
  order: {
    reference: string;
    customer: {
      username: string;
      email: string;
    };
  };
}

/** Pagination metadata from the API. */
interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

/** Full response shape from `/api/admin/payments/transactions`. */
interface TransactionsResponse {
  transactions: Transaction[];
  pagination: Pagination;
}

/** Status display configuration. */
const STATUS_CONFIG = {
  SUCCESS: {
    label: "Succès",
    icon: CheckCircle,
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-200",
  },
  PENDING: {
    label: "En attente",
    icon: Clock,
    className: "bg-amber-500/15 text-amber-600 border-amber-200",
  },
  FAILED: {
    label: "Échec",
    icon: XCircle,
    className: "bg-rose-500/15 text-rose-600 border-rose-200",
  },
  CANCELLED: {
    label: "Annulé",
    icon: AlertCircle,
    className: "bg-gray-500/15 text-gray-600 border-gray-200",
  },
} as const;

/** Format amount in MGA currency. */
function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: currency || "MGA",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Render status badge with icon. */
function StatusBadge({ status }: { status: string }) {
  const config =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5", config.className)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}

export default function PaymentTransactionsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  /** Update search filter and reset to first page. */
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  /** Update status filter and reset to first page. */
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  /** Debounce the search input to avoid excessive API calls. */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  /** Build SWR key from current filter state. */
  const swrKey = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      search: debouncedSearch,
      status: statusFilter,
    });
    return `/api/admin/payments/transactions?${params}`;
  }, [page, debouncedSearch, statusFilter]);

  const { data, isLoading, mutate } = useSWR<TransactionsResponse>(
    swrKey,
    fetcher,
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );

  const transactions = data?.transactions ?? [];
  const pagination = data?.pagination ?? null;

  /** SSE listener for real-time transaction updates. */
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream?role=admin");

    eventSource.onmessage = event => {
      try {
        if (event.data.startsWith("{")) {
          const parsed = JSON.parse(event.data);
          if (
            parsed.type === "TRANSACTION_UPDATE" ||
            parsed.type === "TRANSACTION_BULK_UPDATE" ||
            parsed.type === "ORDER_UPDATE"
          ) {
            mutate();
          }
        }
      } catch {
        /* heartbeat — ignore */
      }
    };

    eventSource.onerror = () => {
      /* EventSource reconnects automatically */
    };

    return () => eventSource.close();
  }, [mutate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Historique Transactions"
        description="Consultez et gérez l'ensemble des flux financiers de votre boutique."
        backHref="/admin/payment"
        onRefresh={() => mutate()}
        isLoading={isLoading}
      >
        <Button className="rounded-xl h-10 px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-none shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </PageHeader>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-white/5 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Réf. commande, transaction..."
                className="pl-11 h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus-visible:ring-indigo-500"
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="SUCCESS">Succès</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="FAILED">Échec</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-white/5">
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Référence
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Commande
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Client
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Montant
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Méthode
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Statut
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col justify-center items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="text-sm text-gray-500 font-medium">
                          Récupération des données...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col justify-center items-center gap-2 opacity-50">
                        <AlertCircle className="w-10 h-10" />
                        <span className="text-gray-500 font-medium">
                          Aucune transaction trouvée.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map(tx => (
                    <TableRow
                      key={tx.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 transition-colors"
                    >
                      <TableCell className="px-6 py-4 font-mono text-[11px] text-gray-500">
                        {tx.reference || "N/A"}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-xs">
                          #{tx.order.reference}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {tx.order.customer.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {tx.order.customer.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {formatPrice(tx.amount, tx.currency)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {tx.provider === "stripe" ? (
                            <CreditCard className="w-4 h-4 text-indigo-500" />
                          ) : (
                            <Smartphone className="w-4 h-4 text-emerald-500" />
                          )}
                          <span className="capitalize text-sm font-medium">
                            {tx.provider}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <StatusBadge status={tx.status} />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-500 text-sm">
                        {format(new Date(tx.createdAt), "dd MMM, HH:mm", {
                          locale: fr,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/5">
              <p className="text-sm text-gray-500">
                Page <span className="font-bold">{pagination.page}</span> sur{" "}
                <span className="font-bold">{pagination.pages}</span>
                {" — "}
                <span className="font-medium">{pagination.total}</span>{" "}
                transactions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl h-9 border-gray-200 dark:border-gray-800"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage(p => Math.min(pagination.pages, p + 1))
                  }
                  disabled={page >= pagination.pages}
                  className="rounded-xl h-9 border-gray-200 dark:border-gray-800"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
