"use client";

import React from "react";
import { ShoppingBag, Heart, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default function CustomerDashboard() {
  const stats = [
    {
      label: "Commandes",
      value: "12",
      icon: ShoppingBag,
      href: "/customer/orders",
    },
    { label: "Favoris", value: "8", icon: Heart, href: "/customer/wishlist" },
    {
      label: "Adresses",
      value: "2",
      icon: MapPin,
      href: "/customer/addresses",
    },
  ];

  const recentOrders = [
    { id: "ORD-001", date: "10 Déc 2024", status: "Livré", total: "89,90 €" },
    { id: "ORD-002", date: "5 Déc 2024", status: "En cours", total: "45,00 €" },
    { id: "ORD-003", date: "28 Nov 2024", status: "Livré", total: "120,50 €" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bonjour, John 👋</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace client
        </p>
      </div>

      {/* Stats */}
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

      {/* Recent orders */}
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
          {recentOrders.map(order => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">{order.id}</p>
                <p className="text-xs text-muted-foreground">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{order.total}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === "Livré"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
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
