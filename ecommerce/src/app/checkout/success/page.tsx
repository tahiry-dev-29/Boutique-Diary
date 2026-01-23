"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  CheckCircle,
  FileText,
  Home,
  Loader2,
  Package,
  ShoppingBag,
  MapPin,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { InvoiceGeneratorService, InvoiceData } from "@/utils/pdf-invoice";
import { toast } from "sonner";
import anime from "animejs";
import { formatPrice } from "@/lib/formatPrice";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderReference = searchParams.get("ref") || "N/A";
  const [order, setOrder] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<HTMLDivElement>(null);

  const fetchOrder = useCallback(async () => {
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
  }, [orderReference]);

  useEffect(() => {
    if (orderReference && orderReference !== "N/A") {
      fetchOrder();
    }
  }, [orderReference, fetchOrder]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      // Entrance animations
      const timeline = anime.timeline({
        easing: "easeOutExpo",
      });

      timeline
        .add({
          targets: containerRef.current.querySelectorAll(".animate-item"),
          translateY: [40, 0],
          opacity: [0, 1],
          delay: anime.stagger(150),
          duration: 1000,
        })
        .add(
          {
            targets: checkmarkRef.current,
            scale: [0, 1.2, 1],
            rotate: "1turn",
            duration: 1200,
            easing: "easeOutElastic(1, .5)",
          },
          "-=800",
        );
    }
  }, [loading]);

  const handleDownloadPDF = async () => {
    if (!order) {
      toast.error("Impossible de générer la facture");
      return;
    }

    setDownloading(true);
    try {
      await InvoiceGeneratorService.generate(order);
      toast.success("Facture téléchargée !");
    } catch (error) {
      console.error("PDF error:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          Récupération de votre commande...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 md:py-20 px-4 transition-colors">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div
        ref={containerRef}
        className="max-w-3xl w-full space-y-8 relative z-10"
      >
        {/* Success Header */}
        <div className="text-center space-y-6 animate-item opacity-0">
          <div
            ref={checkmarkRef}
            className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto shadow-xl border border-primary/10 relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Merci pour votre confiance !
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Votre commande{" "}
              <span className="text-primary font-bold">{orderReference}</span>{" "}
              est confirmée. Préparez-vous à recevoir du style !
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Order Items */}
            <div className="bg-card rounded-[var(--card-radius)] p-6 md:p-8 shadow-[var(--card-shadow)] border-[var(--card-border)] animate-item opacity-0">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  Articles commandés
                </h2>
              </div>

              <div className="space-y-6">
                {order?.items.map(item => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-24 bg-muted/30 rounded-2xl overflow-hidden shrink-0 border border-border group-hover:border-primary/20 transition-colors">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-bold text-foreground leading-tight mb-1 truncate">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Quantité:{" "}
                        <span className="font-medium text-foreground">
                          {item.quantity}
                        </span>
                      </p>
                      <p className="font-black text-foreground">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 space-y-3">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Sous-total</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(order?.total || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Livraison</span>
                  <span className="text-primary font-bold">Gratuite</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-lg font-bold text-gray-900">
                    Total payé
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {formatPrice(order?.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-card rounded-[var(--card-radius)] p-6 md:p-8 shadow-[var(--card-shadow)] border-[var(--card-border)] animate-item opacity-0">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  Informations de livraison
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Destinataire
                  </p>
                  <p className="text-foreground font-bold">
                    {order?.customer.name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {order?.customer.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Adresse
                  </p>
                  <p className="text-foreground leading-relaxed font-medium">
                    {order?.customer.address ||
                      "Adresse de livraison configurée lors de la commande"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-foreground rounded-[var(--card-radius)] p-8 text-background shadow-xl animate-item opacity-0">
              <h2 className="text-2xl font-black mb-6">Prochaines étapes</h2>
              <div className="space-y-4">
                <Link
                  href="/dashboard/customer/orders"
                  className="w-full bg-background/10 hover:bg-background/20 text-background rounded-2xl p-4 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">Suivre mon colis</p>
                      <p className="text-xs text-background/50">
                        Mise à jour en temps réel
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading || !order}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl p-4 transition-all flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      {downloading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Facture PDF</p>
                      <p className="text-xs text-primary-foreground/70">
                        Conserver une preuve
                      </p>
                    </div>
                  </div>
                  {!downloading && (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>
            </div>

            {/* Support/Info */}
            <div className="bg-card rounded-[var(--card-radius)] p-8 border-[var(--card-border)] shadow-[var(--card-shadow)] animate-item opacity-0">
              <h3 className="font-black text-foreground mb-4 text-xl">
                Besoin d&apos;aide ?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Notre équipe est à votre disposition pour toute question
                concernant votre commande. N&apos;hésitez pas à nous contacter.
              </p>
              <Link
                href="/contact"
                className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all underline decoration-2 underline-offset-4"
              >
                Contacter le support <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Return home link */}
            <Link
              href="/"
              className="w-full py-5 rounded-3xl border-2 border-dashed border-border text-muted-foreground font-black hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3 animate-item opacity-0"
            >
              <Home className="w-5 h-5" />
              RETOUR À LA BOUTIQUE
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="mt-20 text-center animate-item opacity-0 italic text-muted-foreground text-sm">
        &quot;Le style est une manière de dire qui vous êtes sans avoir à
        parler.&quot;
      </div>
    </div>
  );
}
