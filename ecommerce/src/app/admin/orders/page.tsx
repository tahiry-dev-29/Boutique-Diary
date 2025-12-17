"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { OrdersStats } from "@/components/admin/orders/OrdersStats";
import { OrderList, Order } from "@/components/admin/orders/OrderList";
import {
  OrderFloatingPanel,
  OrderDetails,
} from "@/components/admin/orders/OrderViewModal";
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
import { generateInvoice } from "@/utils/invoice-generator";

interface OrdersResponse {
  orders: Array<{
    id: string;
    reference: string;
    customer: { name: string; email: string };
    status:
      | "PENDING"
      | "PROCESSING"
      | "SHIPPED"
      | "DELIVERED"
      | "CANCELLED"
      | "COMPLETED";
    total: number;
    createdAt: string;
  }>;
  counts: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    today: number;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [stats, setStats] = useState({
    totalOrdersToday: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    todayTrend: 0,
    completedTrend: 0,
    pendingTrend: 0,
    cancelledTrend: 0,
  });
  const [loading, setLoading] = useState(true);

  
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<
    Order | OrderDetails | null
  >(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders?limit=200");
      const data: OrdersResponse = await res.json();

      
      const formattedOrders: Order[] = data.orders.map(order => ({
        id: order.id,
        reference: order.reference,
        customer: {
          name: order.customer.name,
          email: order.customer.email,
        },
        status: order.status,
        total: order.total,
        createdAt: new Date(order.createdAt),
      }));

      setOrders(formattedOrders);
      setCounts(data.counts);

      
      setStats({
        totalOrdersToday: data.counts.today,
        completedOrders: data.counts.completed,
        pendingOrders: data.counts.pending,
        cancelledOrders: data.counts.cancelled,
        todayTrend: Math.round(
          (data.counts.today / Math.max(data.counts.total, 1)) * 100,
        ),
        completedTrend: Math.round(
          (data.counts.completed / Math.max(data.counts.total, 1)) * 100,
        ),
        pendingTrend: Math.round(
          (data.counts.pending / Math.max(data.counts.total, 1)) * 100,
        ),
        cancelledTrend: -Math.round(
          (data.counts.cancelled / Math.max(data.counts.total, 1)) * 100,
        ),
      });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetails = (order: Order) => {
    
    const panelStatus =
      order.status === "COMPLETED" ? "DELIVERED" : order.status;

    const orderDetails: OrderDetails = {
      id: order.id,
      reference: order.reference,
      customer: order.customer,
      status: panelStatus as OrderDetails["status"],
      total: order.total,
      createdAt: order.createdAt,
      items: [], 
    };
    setSelectedOrder(orderDetails);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSendInvoice = async (order: Order | OrderDetails) => {
    try {
      let orderToPrint = order as OrderDetails;

      
      if (!orderToPrint.items) {
        toast.message(`Préparation de la facture #${order.reference}...`);
        const res = await fetch(`/api/admin/orders/${order.id}`);
        if (!res.ok)
          throw new Error("Impossible de récupérer les détails de la commande");
        const data = await res.json();

        orderToPrint = {
          ...data,
          createdAt: new Date(data.createdAt),
          items: data.items.map((item: any) => ({
            id: item.id,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            price: item.price,
            variant:
              item.color || item.size
                ? [item.color, item.size].filter(Boolean).join(", ")
                : undefined,
          })),
        };
      }

      generateInvoice(orderToPrint);
      toast.success(`Facture #${order.reference} générée`);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      toast.error("Erreur lors de la génération de la facture");
    }
  };

  
  const handleRequestCancel = (order: Order | OrderDetails) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    try {
      console.log("Cancelling order:", orderToCancel.id);

      const res = await fetch(`/api/admin/orders/${orderToCancel.id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("Cancel response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      toast.success(`Commande #${orderToCancel.reference} annulée`);
      handleCloseModal();
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      
      fetchOrders();
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'annulation",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commandes"
        description="Gérer les commandes de votre boutique"
      />

      {}
      <OrdersStats stats={stats} loading={loading} />

      {}
      <OrderList
        orders={orders}
        loading={loading}
        counts={counts}
        onViewDetails={handleViewDetails}
        onSendInvoice={handleSendInvoice}
        onDelete={handleRequestCancel}
      />

      {}
      <OrderFloatingPanel
        order={selectedOrder}
        open={isModalOpen}
        onClose={handleCloseModal}
      />

      {}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler la commande{" "}
              <strong>#{orderToCancel?.reference}</strong> ?
              <br />
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non, garder</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Oui, annuler la commande
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
