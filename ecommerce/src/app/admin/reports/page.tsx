"use client";

import React from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, ShoppingBag, Users, ArrowRight } from "lucide-react";

const reportSections = [
  {
    title: "Ventes",
    description: "Revenu, commandes, panier moyen et taux de conversion.",
    icon: BarChart,
    href: "/admin/reports/sales",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  },
  {
    title: "Produits",
    description: "Meilleures ventes, état des stocks et performances.",
    icon: ShoppingBag,
    href: "/admin/reports/products",
    color:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
  },
  {
    title: "Clients",
    description: "Croissance de la base clients et top acheteurs.",
    icon: Users,
    href: "/admin/reports/customers",
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
];

export default function ReportsDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Rapports & Analyses"
        description="Vue d'ensemble des performances de votre boutique."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportSections.map(section => (
          <Link key={section.title} href={section.href} className="group">
            <Card className="h-full border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-100 dark:bg-gray-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${section.color} w-fit`}>
                    <section.icon size={24} />
                  </div>
                  <ArrowRight className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <CardTitle className="mt-4">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
