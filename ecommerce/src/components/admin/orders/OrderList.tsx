"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
    label: "Pending",
    variant: "warning" as const,
    icon: Clock,
  },
  PROCESSING: {
    label: "Processing",
    variant: "default" as const,
    icon: Clock,
  },
  SHIPPED: {
    label: "Shipped",
    variant: "default" as const,
    icon: CheckCircle,
  },
  DELIVERED: {
    label: "Delivered",
    variant: "success" as const,
    icon: CheckCircle,
  },
  COMPLETED: {
    label: "Completed",
    variant: "success" as const,
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "destructive" as const,
    icon: XCircle,
  },
};

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export function OrderList({
  orders,
  loading,
  counts,
  onViewDetails,
  onSendInvoice,
  onDelete,
}: OrderListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Filter orders based on tab and search
  const filteredOrders = orders.filter(order => {
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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.reference.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId],
    );
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Order List
          </h2>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            + Create New Order
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="bg-muted h-auto p-1 flex-wrap">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-background"
              >
                Total ({counts.total})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-background"
              >
                Completed ({counts.completed})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-background"
              >
                Pending ({counts.pending})
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="data-[state=active]:bg-background"
              >
                Cancelled ({counts.cancelled})
              </TabsTrigger>
            </TabsList>

            {/* Search and filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 w-44"
                />
              </div>
              <Button variant="outline" size="icon">
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Tabs>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedOrders.length === filteredOrders.length &&
                      filteredOrders.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Order ID
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Customer
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Total Amount
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
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">
                        Chargement...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Aucune commande trouvée
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => {
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
                        <span className="font-medium text-primary">
                          #{order.reference}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={order.customer.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                              {order.customer.name
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {order.customer.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={status.variant}
                          className="gap-1 font-medium"
                        >
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
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onViewDetails?.(order)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Order Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onSendInvoice?.(order)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Send Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete?.(order)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Client Profile
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
      </CardContent>
    </Card>
  );
}

export default OrderList;
