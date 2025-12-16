"use client";

import React, { useEffect, useState } from "react";
import { OrdersStats } from "@/components/admin/orders/OrdersStats";
import { OrderList, Order } from "@/components/admin/orders/OrderList";

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

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/orders?limit=50");
        const data: OrdersResponse = await res.json();

        // Transform orders for the component
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

        // Calculate stats with trends (simulated for now)
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
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = (order: Order) => {
    console.log("View details:", order);
    // TODO: Open modal with order details
  };

  const handleSendInvoice = (order: Order) => {
    console.log("Send invoice:", order);
    // TODO: Generate and send invoice
  };

  const handleDelete = async (order: Order) => {
    if (!confirm(`Supprimer la commande #${order.reference} ?`)) return;

    try {
      // TODO: Implement delete API
      console.log("Delete:", order);
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm">
            Gérer les commandes de votre boutique
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <OrdersStats stats={stats} loading={loading} />

      {/* Orders List */}
      <OrderList
        orders={orders}
        loading={loading}
        counts={counts}
        onViewDetails={handleViewDetails}
        onSendInvoice={handleSendInvoice}
        onDelete={handleDelete}
      />
    </div>
  );
}
