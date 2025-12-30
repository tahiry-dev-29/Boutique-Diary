"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Loader2,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

import { PageHeader } from "@/components/admin/PageHeader";

export default function PaymentTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/payments/transactions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: currency || "MGA",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      SUCCESS: {
        label: "Succès",
        variant: "success",
        icon: CheckCircle,
        className: "bg-emerald-500/15 text-emerald-600 border-emerald-200",
      },
      PENDING: {
        label: "En attente",
        variant: "warning",
        icon: Clock,
        className: "bg-amber-500/15 text-amber-600 border-amber-200",
      },
      FAILED: {
        label: "Échec",
        variant: "destructive",
        icon: XCircle,
        className: "bg-rose-500/15 text-rose-600 border-rose-200",
      },
      CANCELLED: {
        label: "Annulé",
        variant: "secondary",
        icon: AlertCircle,
        className: "bg-gray-500/15 text-gray-600 border-gray-200",
      },
    };

    const config = styles[status as keyof typeof styles] || styles.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={cn("gap-1.5", config.className)}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Historique complet des paiements reçus."
        backHref="/admin/payment"
        onRefresh={fetchTransactions}
        isLoading={loading}
      >
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par réf. commande ou transaction..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="SUCCESS">Succès</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="FAILED">Échec</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Chargement...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucune transaction trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map(tx => (
                    <TableRow key={tx.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        {tx.reference || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-primary font-medium">
                        #{tx.order.reference}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {tx.order.customer.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tx.order.customer.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatPrice(tx.amount, tx.currency)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {tx.provider}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(tx.createdAt), "dd MMM HH:mm", {
                          locale: fr,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {}
        </CardContent>
      </Card>
    </div>
  );
}
