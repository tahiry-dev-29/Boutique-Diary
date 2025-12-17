"use client";

import Link from "next/link";
import { CreditCard, Banknote, ArrowRight, Settings, List } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";

export default function PaymentDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description="Gérez les modes de paiement et consultez l'historique des transactions."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gray-900/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <Settings className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-white">
                  Modes de Paiement
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configurez les méthodes de paiement
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">
              Activez ou désactivez MVola, Orange Money, Stripe et autres moyens
              de paiement.
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                MVola (Activé)
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />
                Stripe (Par défaut)
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/admin/payment/methods" className="w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Gérer les méthodes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-gray-900/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <List className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-white">
                  Historique des Transactions
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Visualisez tous les paiements reçus
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">
              Suivez les statuts des transactions, filtrez par méthode et
              exportez les rapports.
            </p>
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg mb-2">
              <span className="text-sm text-gray-300">
                Dernière transaction
              </span>
              <span className="text-xs font-mono text-emerald-400">
                Il y a 5 min
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/admin/payment/transactions" className="w-full">
              <Button
                variant="outline"
                className="w-full border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Voir les transactions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
