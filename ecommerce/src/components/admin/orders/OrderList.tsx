"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
  onDelete,
}: OrderListProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter orders based on tab and search
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab filter
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
    });
  }, [orders, activeTab, searchQuery]);

  
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedOrders.length === paginatedOrders.length &&
                      paginatedOrders.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  N° Commande
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Client
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Statut
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Montant
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Date
                </TableHead>
                <TableHead className="w-12"></TableHead>
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

                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => toggleSelectOrder(order.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-medium text-primary">
                          #{order.reference}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={order.customer.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white text-xs font-medium">
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
                onClick={() => goToPage(currentPage - 1)}
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
      </CardContent>
    </Card>
  );
}

export default OrderList;
