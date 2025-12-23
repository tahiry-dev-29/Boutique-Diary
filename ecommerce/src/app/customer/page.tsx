import React from "react";
import { ShoppingBag, Heart, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getData() {
  const payload = await verifyToken();
  if (!payload || !payload.userId) {
    return null;
  }

  const userId = payload.userId as number;

  const [user, ordersCount, wishlistCount, addressesCount, recentOrders] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      }),
      prisma.order.count({ where: { customerId: userId } }),
      prisma.wishlistItem.count({ where: { userId: userId } }),
      prisma.address.count({ where: { userId: userId } }),
      prisma.order.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          items: true,
        },
      }),
    ]);

  return {
    user,
    ordersCount,
    wishlistCount,
    addressesCount,
    recentOrders,
  };
}

export default async function CustomerDashboard() {
  const data = await getData();

  if (!data || !data.user) {
    redirect("/login");
  }

  const { user, ordersCount, wishlistCount, addressesCount, recentOrders } =
    data;

  const stats = [
    {
      label: "Commandes",
      value: ordersCount.toString(),
      icon: ShoppingBag,
      href: "/customer/orders",
    },
    {
      label: "Favoris",
      value: wishlistCount.toString(),
      icon: Heart,
      href: "/customer/wishlist",
    },
    {
      label: "Adresses",
      value: addressesCount.toString(),
      icon: MapPin,
      href: "/customer/addresses",
    },
  ];

  return (
    <div className="space-y-8">
      {}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bonjour, {user.username} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace client
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className="dark:border-gray-700/50 border border-border rounded-xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <stat.icon size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {}
      <div className="dark:border-gray-700/50 border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Commandes récentes
            </h2>
          </div>
          <Link
            href="/customer/orders"
            className="text-sm text-primary hover:underline font-medium"
          >
            Voir tout
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.length > 0 ? (
            recentOrders.map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {order.reference}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {order.total.toFixed(2)} Ar
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "DELIVERED" ||
                      order.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune commande récente.
            </p>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/shop"
          className="bg-primary text-primary-foreground rounded-xl p-6 hover:opacity-90 transition-opacity"
        >
          <h3 className="font-semibold text-lg">Continuer vos achats</h3>
          <p className="text-sm opacity-80 mt-1">
            Découvrez nos nouveautés et promotions
          </p>
        </Link>
        <Link
          href="/customer/settings"
          className="dark:border-gray-700/50 border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold text-lg text-foreground">
            Gérer votre compte
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Modifier vos informations personnelles
          </p>
        </Link>
      </div>
    </div>
  );
}
