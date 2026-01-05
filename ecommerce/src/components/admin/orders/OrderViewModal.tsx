"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle,
  Clock,
  Truck,
  Package,
  CreditCard,
  MapPin,
  Calendar,
  Mail,
  Printer,
  Download,
  AlertCircle,
} from "lucide-react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { generateInvoicePDF } from "@/utils/pdf-invoice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface OrderDetails {
  id: string;
  reference: string;
  customer: { name: string; email: string; address?: string };
  status:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "COMPLETED";
  total: number;
  createdAt: Date | string;
  items: Array<{
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    price: number;
    variant?: string;
  }>;
}

const StatusBadge = ({ status }: { status: OrderDetails["status"] }) => {
  const styles = {
    PENDING: {
      label: "En attente",
      classes: "bg-amber-500/15 text-amber-600 border-amber-200",
      icon: Clock,
    },
    PROCESSING: {
      label: "Traitement",
      classes: "bg-blue-500/15 text-blue-600 border-blue-200",
      icon: Package,
    },
    SHIPPED: {
      label: "Expédié",
      classes: "bg-indigo-500/15 text-indigo-600 border-indigo-200",
      icon: Truck,
    },
    DELIVERED: {
      label: "Livré",
      classes: "bg-emerald-500/15 text-emerald-600 border-emerald-200",
      icon: CheckCircle,
    },
    CANCELLED: {
      label: "Annulé",
      classes: "bg-rose-500/15 text-rose-600 border-rose-200",
      icon: AlertCircle,
    },
    COMPLETED: {
      label: "Terminé",
      classes: "bg-green-500/15 text-green-600 border-green-200",
      icon: CheckCircle,
    },
  };
  const config = styles[status] || styles.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide",
        config.classes,
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 text-sm group min-w-0">
    <div className="p-2 rounded-lg bg-secondary/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-foreground font-semibold break-words">{value}</span>
    </div>
  </div>
);

export function OrderFloatingPanel({
  order: initialOrder,
  open,
  onClose,
}: {
  order: OrderDetails | null;
  open: boolean;
  onClose: () => void;
}) {
  const [order, setOrder] = useState<OrderDetails | null>(initialOrder);
  useEffect(() => {
    if (open && initialOrder?.id) {
      fetch(`/api/admin/orders/${initialOrder.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setOrder({
              ...data,
              createdAt: new Date(data.createdAt),
              items:
                data.items?.map((item: any) => ({
                  id: item.id,
                  productName: item.productName,
                  productImage: item.productImage,
                  quantity: item.quantity,
                  price: item.price,
                  variant:
                    item.color || item.size
                      ? [item.color, item.size].filter(Boolean).join(", ")
                      : undefined,
                })) || [],
            });
          }
        })
        .catch(console.error);
    }
  }, [open, initialOrder?.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      setOrder({ ...order, status: newStatus as any });
      toast.success("Statut mis à jour avec succès");
    } catch (error: any) {
      console.error("[OrderUpdateError]", error);
      toast.error(error.message || "Impossible de mettre à jour le statut");
    }
  };

  if (!order) return null;

  const orderDate = new Date(order.createdAt);
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="
          w-full h-full 
          sm:w-[480px] sm:h-[calc(100vh-2rem)]
          sm:mt-4 sm:mb-4 sm:mr-4 sm:rounded-3xl 
          border-l sm:border border-border/40 shadow-2xl 
          bg-gray-100/95 dark:bg-gray-800/95 backdrop-blur-xl
          p-0 flex flex-col overflow-hidden
          data-[state=closed]:slide-out-to-right
          data-[state=open]:slide-in-from-right
        "
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/40 bg-secondary/10">
          <SheetTitle className="sr-only">
            Commande #{order.reference}
          </SheetTitle>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Commande
              </h2>
              <span className="text-muted-foreground font-mono text-sm">
                #{order.reference}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Passée le{" "}
              {format(orderDate, "dd MMM yyyy à HH:mm", { locale: fr })}
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0 p-4 sm:p-6">
          <div className="space-y-6 sm:space-y-8">
            {}
            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-secondary/20 border border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  État actuel
                </span>
                <div className="w-[180px]">
                  <Select
                    defaultValue={order.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="PROCESSING">Traitement</SelectItem>
                      <SelectItem value="SHIPPED">Expédié</SelectItem>
                      <SelectItem value="DELIVERED">Livré</SelectItem>
                      <SelectItem value="COMPLETED">Terminé</SelectItem>
                      <SelectItem value="CANCELLED">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-background/50 border-border/50 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 mr-2" />
                  Imprimer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-background/50 border-border/50 shadow-sm"
                  onClick={() => generateInvoicePDF(order as any)}
                >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Facture
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                Client
              </h3>
              <div className="grid gap-4 bg-background/40 p-4 rounded-2xl border border-border/30">
                <InfoRow
                  icon={Calendar}
                  label="Date"
                  value={format(orderDate, "dd MMMM yyyy", { locale: fr })}
                />
                <Separator className="bg-border/40" />
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={order.customer.email}
                />
                <Separator className="bg-border/40" />
                <InfoRow
                  icon={MapPin}
                  label="Adresse"
                  value={order.customer.address || "Point relais"}
                />
                <Separator className="bg-border/40" />
                <InfoRow
                  icon={CreditCard}
                  label="Paiement"
                  value="Mobile Money (MVola)"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                Panier ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-2xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/40"
                  >
                    <div className="h-16 w-16 rounded-xl bg-white border border-border/50 overflow-hidden relative shrink-0">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                          <Package className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="font-semibold text-sm truncate text-foreground">
                        {item.productName}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">
                          {item.variant}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 h-5 text-[10px] font-medium"
                        >
                          x{item.quantity}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatMoney(item.price)} / u
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold text-sm tabular-nums">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 bg-background/80 backdrop-blur-md border-t border-border/40">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Sous-total</span>
              <span>{formatMoney(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Livraison</span>
              <span className="text-emerald-600 font-medium">Gratuite</span>
            </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <span className="font-bold text-lg">Total à payer</span>
            <span className="font-black text-xl text-primary">
              {formatMoney(order.total)}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
