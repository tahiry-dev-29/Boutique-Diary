"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  RefreshCcw,
  Loader2,
  FileText,
} from "lucide-react";
import { InvoiceGeneratorService, InvoiceData } from "@/utils/pdf-invoice";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function CustomerOrders() {
  const [orders, setOrders] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [actionOrder, setActionOrder] = useState<InvoiceData | null>(null);
  const [actionType, setActionType] = useState<"CANCEL" | "COMPLETE" | null>(
    null,
  );

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customer/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);

  const handleDownloadPDF = async (orderRef: string) => {
    setDownloadingRef(orderRef);
    try {
      const res = await fetch(`/api/orders/${orderRef}/invoice`);
      if (res.ok) {
        const data = await res.json();
        await InvoiceGeneratorService.generate(data);
        toast.success("Facture téléchargée !");
      } else {
        toast.error("Impossible de récupérer les données de la facture");
      }
    } catch (error) {
      console.error("PDF error:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setDownloadingRef(null);
    }
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleStatusUpdate = async () => {
    if (!actionOrder || !actionType) return;

    const newStatus = actionType === "CANCEL" ? "CANCELLED" : "COMPLETED";

    try {
      const res = await fetch(`/api/customer/orders/${actionOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        let errorMessage = "Une erreur est survenue";
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response", e);
        }
        throw new Error(errorMessage);
      }

      toast.success(
        actionType === "CANCEL" ? "Commande annulée" : "Réception confirmée !",
      );
      fetchOrders();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      console.error(err);
      toast.error(message);
    } finally {
      setActionOrder(null);
      setActionType(null);
    }
  };

  const getStatusIcon = (status: string) => {
    const s = status.toUpperCase();
    if (s === "DELIVERED" || s === "COMPLETED")
      return <CheckCircle className="text-green-500" size={20} />;
    if (s === "SHIPPED") return <Truck className="text-blue-500" size={20} />;
    if (s === "PROCESSING" || s === "PENDING")
      return <Clock className="text-yellow-500" size={20} />;
    return <Package className="text-muted-foreground" size={20} />;
  };

  const getStatusClass = (status: string) => {
    const s = status.toUpperCase();
    if (s === "DELIVERED" || s === "COMPLETED")
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (s === "SHIPPED")
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (s === "PROCESSING" || s === "PENDING")
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes commandes</h1>
          <p className="text-muted-foreground mt-1">
            Suivez l&apos;état de vos commandes
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors text-sm font-medium"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCcw size={16} />
          )}
          Actualiser
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && orders.length === 0 ? (
          <div className="py-12 flex justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div
              key={order.id}
              className="dark:border-gray-700/50 border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-muted/50">
                <div className="flex items-center gap-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      {order.reference}
                      <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 rounded flex items-center gap-1">
                        🇲🇬 MG
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="p-4 space-y-3">
                {order.items.map((item, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.productName || "Produit inconnu"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">
                      {formatMoney(item.price)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatMoney(order.total)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleDownloadPDF(order.reference)}
                    disabled={downloadingRef === order.reference}
                  >
                    {downloadingRef === order.reference ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    Facture
                  </Button>
                  {["PENDING", "PROCESSING"].includes(order.status) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setActionOrder(order);
                        setActionType("CANCEL");
                      }}
                    >
                      Annuler
                    </Button>
                  )}

                  {["SHIPPED", "DELIVERED"].includes(order.status) && (
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        setActionOrder(order);
                        setActionType("COMPLETE");
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmer réception
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">
              Aucune commande trouvée.
            </p>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!actionOrder}
        onOpenChange={open => !open && setActionOrder(null)}
      >
        <AlertDialogContent className="bg-gray-100 dark:bg-gray-800 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "CANCEL"
                ? "Annuler la commande ?"
                : "Confirmer la réception ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "CANCEL"
                ? "Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible."
                : "Confirmez-vous avoir bien reçu votre commande ? Cela clôturera la commande."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              className={
                actionType === "CANCEL"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {actionType === "CANCEL" ? "Oui, annuler" : "Oui, confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
