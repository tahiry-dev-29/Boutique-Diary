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
import { Ticket, Percent, ArrowRight } from "lucide-react";

const marketingSections = [
  {
    title: "Codes Promo",
    description: "Gérez les codes de réduction et les bons d'achat.",
    icon: Ticket,
    href: "/admin/marketing/codes-promo",
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400",
  },
  {
    title: "Règles de Promotion",
    description: "Configurez des réductions automatiques et offres spéciales.",
    icon: Percent,
    href: "/admin/marketing/promotions",
    color:
      "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  },
];

export default function MarketingDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Marketing"
          description="Gérez vos campagnes promotionnelles et fidélisez vos clients."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketingSections.map((section) => (
          <Link key={section.title} href={section.href} className="group">
            <Card className="h-full border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-900/40 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${section.color} w-fit`}>
                    <section.icon size={24} />
                  </div>
                  <ArrowRight className="text-gray-400 group-hover:text-primary transition-colors" />
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
