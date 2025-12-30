"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, FileText, Home, Loader2 } from "lucide-react";
import { generateInvoicePDF, InvoiceData } from "@/utils/pdf-invoice";
import { toast } from "sonner";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderReference = searchParams.get("ref") || "N/A";
  const [order, setOrder] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (orderReference && orderReference !== "N/A") {
      fetchOrder();
    }
  }, [orderReference]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderReference}/invoice`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!order) {
      toast.error("Impossible de générer la facture");
      return;
    }

    setDownloading(true);
    try {
      generateInvoicePDF(order);
      toast.success("Facture téléchargée !");
    } catch (error) {
      console.error("PDF error:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Commande Confirmée !
          </h1>
          <p className="text-gray-500">
            Merci pour votre commande. Nous avons bien reçu votre paiement et
            votre commande est en cours de préparation.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Numéro de commande</span>
            <span className="font-mono font-bold">{orderReference}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium">
              {new Date().toLocaleDateString("fr-MG")}
            </span>
          </div>
          {order && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-lg">
                {new Intl.NumberFormat("fr-MG", {
                  style: "currency",
                  currency: "MGA",
                  maximumFractionDigits: 0,
                }).format(order.total)}
              </span>
            </div>
          )}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleDownloadPDF}
              disabled={loading || downloading || !order}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-black hover:bg-gray-800 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {loading
                ? "Chargement..."
                : downloading
                  ? "Génération..."
                  : "Télécharger la facture (PDF)"}
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-6">
          <Link
            href="/"
            className="block w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/dashboard/customer/orders"
            className="block w-full border border-gray-200 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            Suivre ma commande
          </Link>
        </div>
      </div>
    </div>
  );
}
