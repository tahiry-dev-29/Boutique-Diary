"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Search,
  Calendar,
  MoreHorizontal,
  Eye,
  FileText,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Download,
  SlidersHorizontal,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Order {
  id: string;
  reference: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  status:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "COMPLETED";
  total: number;
  createdAt: Date;
}

interface OrderListProps {
  orders: Order[];
  loading?: boolean;
  counts: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  onViewDetails?: (order: Order) => void;
  onSendInvoice?: (order: Order) => void;
  onDownloadPDF?: (order: Order) => void;
  onDelete?: (order: Order) => void;
}

const statusConfig = {
  PENDING: {
    label: "En attente",
    variant: "warning" as const,
    icon: Clock,
  },
  PROCESSING: {
    label: "Traitement",
    variant: "default" as const,
    icon: Clock,
  },
  SHIPPED: {
    label: "Expédié",
    variant: "default" as const,
    icon: CheckCircle,
  },
  DELIVERED: {
    label: "Livré",
    variant: "success" as const,
    icon: CheckCircle,
  },
  COMPLETED: {
    label: "Terminé",
    variant: "success" as const,
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Annulé",
    variant: "destructive" as const,
    icon: XCircle,
  },
};

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: "MGA",
    maximumFractionDigits: 0,
  }).format(amount);
};

type TabValue = "all" | "completed" | "pending" | "cancelled";

export function OrderList({
  orders,
  loading,
  counts,
  onViewDetails,
  onSendInvoice,
  onDownloadPDF,
  onDelete,
}: OrderListProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const handleBulkAction = async (action: string) => {
    if (selectedOrders.length === 0) return;

    setIsBulkLoading(true);
    try {
      let res;
      if (action === "delete") {
        
        toast.error("Suppression groupée non implémentée pour les commandes");
        return;
      } else {
        res = await fetch("/api/admin/orders/bulk", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedOrders,
            status: action.toUpperCase(),
          }),
        });
      }

      if (res?.ok) {
        toast.success(`${selectedOrders.length} commandes mises à jour`);
        setSelectedOrders([]);
        
        
        
      } else {
        toast.error("Échec de l'action groupée");
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Erreur de connexion");
    } finally {
      setIsBulkLoading(false);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  
  const filteredOrders = useMemo(
    () =>
      (orders || []).filter(order => {
        
        if (
          activeTab === "completed" &&
          !["COMPLETED", "DELIVERED"].includes(order.status)
        ) {
          return false;
        }
        if (
          activeTab === "pending" &&
          !["PENDING", "PROCESSING"].includes(order.status)
        ) {
          return false;
        }
        if (activeTab === "cancelled" && order.status !== "CANCELLED") {
          return false;
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            order.reference.toLowerCase().includes(query) ||
            order.customer.name.toLowerCase().includes(query)
          );
        }

        return true;
      }),
    [orders, activeTab, searchQuery],
  );

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedOrders([]);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId],
    );
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const tabs: { value: TabValue; label: string; count: number }[] = [
    { value: "all", label: "Total", count: counts.total },
    { value: "completed", label: "Completed", count: counts.completed },
    { value: "pending", label: "Pending", count: counts.pending },
    { value: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <Card className="border border-border shadow-sm dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Liste des commandes
          </h2>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          {}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    activeTab === tab.value
                      ? "dark:bg-gray-900/50 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }
                `}
              >
                {tab.label}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-md ${
                    activeTab === tab.value
                      ? "bg-primary/10 text-primary"
                      : "bg-muted-foreground/10"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 w-48 dark:bg-gray-900/50"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filtres avancés</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Calendar className="w-4 h-4 mr-2" />
                  Par date
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Filter className="w-4 h-4 mr-2" />
                  Par montant
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredOrders.length} commande
            {filteredOrders.length > 1 ? "s" : ""}{" "}
            {searchQuery && `pour "${searchQuery}"`}
          </span>
          {selectedOrders.length > 0 && (
            <span className="text-primary font-medium">
              {selectedOrders.length} sélectionné
              {selectedOrders.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/30 dark:bg-gray-900/50">
              <TableRow className="border-b border-gray-100 dark:border-gray-700 hover:bg-transparent">
                <TableHead className="w-12 text-center pl-4">
                  <Checkbox
                    checked={
                      selectedOrders.length === paginatedOrders.length &&
                      paginatedOrders.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    className="rounded-md border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                  Référence
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                  Client
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                  Montant
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                  Date
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                  Statut
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4 text-right pr-4">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">
                        Chargement des commandes...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className="w-10 h-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Aucune commande trouvée
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map(order => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;
                  const isSelected = selectedOrders.includes(order.id);

                  return (
                    <TableRow
                      key={order.id}
                      className={`hover:bg-muted/30 cursor-pointer transition-colors border-b border-gray-100/50 dark:border-gray-700/50 ${
                        isSelected
                          ? "bg-blue-50/50 dark:bg-blue-900/20 shadow-[inset_4px_0_0_0_#3b82f6]"
                          : ""
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectOrder(order.id)}
                          className="rounded-md border-gray-300 data-[state=checked]:bg-black/90 data-[state=checked]:border-black"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-primary">
                            #{order.reference}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex items-center gap-1 leading-none">
                            🇲🇬 MG
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={order.customer.avatar} />
                            <AvatarFallback className="bg-linear-to-br from-violet-500 to-pink-500 text-white text-xs font-medium">
                              {order.customer.name
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {order.customer.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {order.customer.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1.5">
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-foreground">
                          {formatPrice(order.total)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {format(order.createdAt, "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onViewDetails?.(order)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onSendInvoice?.(order)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Envoyer facture
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDownloadPDF?.(order)}
                            >
                              <Download className="w-4 h-4 mr-2 text-primary" />
                              Télécharger PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete?.(order)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            {}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Afficher</span>
              <Select
                value={pageSize.toString()}
                onValueChange={value => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>par page</span>
            </div>

            {}
            <div className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages} ({filteredOrders.length}{" "}
              résultats)
            </div>

            {}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {}
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {}
        {selectedOrders.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-xl bg-black/90">
              <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedOrders.length}
                </div>
                <span className="text-sm font-medium text-white/90">
                  Commandes sélectionnées
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10 h-10 px-4 rounded-xl gap-2 transition-all active:scale-95 disabled:opacity-50"
                  onClick={() => handleBulkAction("delivered")}
                  disabled={isBulkLoading}
                >
                  <CheckCircle className="h-4 w-4" />
                  Livré
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10 h-10 px-4 rounded-xl gap-2 transition-all active:scale-95 disabled:opacity-50"
                  onClick={() => handleBulkAction("shipped")}
                  disabled={isBulkLoading}
                >
                  <Send className="h-4 w-4" />
                  Expédié
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-400 hover:bg-rose-500/10 h-10 px-4 rounded-xl gap-2 transition-all active:scale-95 disabled:opacity-50"
                  onClick={() => handleBulkAction("cancelled")}
                  disabled={isBulkLoading}
                >
                  <XCircle className="h-4 w-4" />
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OrderList;
