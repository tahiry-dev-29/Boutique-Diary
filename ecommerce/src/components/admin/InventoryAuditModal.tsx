"use client";

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  ClipboardList,
  AlertTriangle,
  Package,
  Check,
  ShieldAlert,
  History as HistoryIcon,
  ArrowRightLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AuditItem {
  uniqueId: string;
  productId: number;
  imageId: number | null;
  name: string;
  reference: string;
  variant: string;
  stock: number;
  image: string;
}

interface InventoryAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: AuditItem | null;
  onConfirm: (data: {
    newStock: number;
    reason: string;
    note: string;
  }) => Promise<void>;
}

const REASONS = [
  {
    id: "Stocktake",
    label: "Inventaire",
    icon: ClipboardList,
    desc: "Comptage régulier",
  },
  {
    id: "Damage",
    label: "Dommage",
    icon: AlertTriangle,
    desc: "Articles abîmés",
  },
  { id: "Expire", label: "Expiration", icon: ShieldAlert, desc: "Date passée" },
  { id: "Misplacement", label: "Perdu / Égaré", icon: X, desc: "Introuvable" },
  { id: "Thief", label: "Vol", icon: AlertTriangle, desc: "Disparition" },
  { id: "Other", label: "Autre", icon: Package, desc: "Autre raison" },
];

export function InventoryAuditModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: InventoryAuditModalProps) {
  const [physicalCount, setPhysicalCount] = useState<string>("");
  const [reason, setReason] = useState("Stocktake");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setPhysicalCount(item.stock.toString());
      setReason("Stocktake");
      setNote("");
      fetchHistory();
    }
  }, [isOpen, item]);

  const fetchHistory = async () => {
    if (!item) return;
    try {
      setLoadingHistory(true);
      const url = new URL(
        `/api/admin/stock/${item.productId}/history`,
        window.location.href,
      );
      if (item.imageId) {
        url.searchParams.set("productImageId", item.imageId.toString());
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSave = async () => {
    try {
      const val = parseInt(physicalCount);
      if (isNaN(val)) return;

      setSubmitting(true);
      await onConfirm({ newStock: val, reason, note });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return null;

  const currentVal = parseInt(physicalCount) || 0;
  const discrepancy = currentVal - item.stock;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="
          /* Styles Flottants (Floating) */
          w-[90vw] sm:w-[700px] 
          mt-4 mb-4 mr-4 rounded-3xl 
          h-[calc(100vh-2rem)] 
          border border-border/40 shadow-2xl 
          bg-gray-100/95 dark:bg-gray-800/95 backdrop-blur-xl
          p-0 flex flex-col overflow-hidden
          data-[state=closed]:slide-out-to-right
          data-[state=open]:slide-in-from-right
        "
      >
        {/* En-tête Fixe */}
        <div className="flex items-center justify-between p-6 border-b border-border/40 bg-secondary/10 shrink-0">
          <SheetTitle className="sr-only">Ajustement de Stock</SheetTitle>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background/50 rounded-lg border border-border/50">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Ajustement</h2>
              <p className="text-xs text-muted-foreground">
                Mise à jour d'inventaire
              </p>
            </div>
          </div>
        </div>

        {/* Contenu Défilant */}
        <ScrollArea className="flex-1 min-h-0 p-6">
          <div className="space-y-8 pb-6">
            {/* Produit Info */}
            <div className="relative p-4 rounded-2xl bg-background/50 border border-border/50 shadow-sm">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-background overflow-hidden border border-border/50 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate text-base">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border/50 text-muted-foreground bg-background/50 font-normal tracking-wide"
                    >
                      {item.reference}
                    </Badge>
                    {item.variant !== "-" && (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-primary/20 text-primary bg-primary/5 font-normal"
                      >
                        {item.variant}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  Stock Physique
                </Label>
                <div className="relative group">
                  <Input
                    type="number"
                    value={physicalCount}
                    onChange={e => setPhysicalCount(e.target.value)}
                    className="h-14 text-2xl font-bold bg-background/50 border-border/50 focus:border-primary/50 focus:ring-0 transition-all rounded-xl px-4 text-foreground placeholder:text-muted-foreground font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  Écart
                </Label>
                <div
                  className={cn(
                    "h-14 flex items-center justify-center rounded-xl border border-dashed transition-all",
                    discrepancy === 0
                      ? "border-border/50 bg-background/30 text-muted-foreground"
                      : discrepancy > 0
                        ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                        : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
                  )}
                >
                  <span className="text-xl font-bold mono">
                    {discrepancy > 0 ? "+" : ""}
                    {discrepancy}
                  </span>
                  <span className="ml-2 text-xs font-medium opacity-70">
                    Unités
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                Raison
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {REASONS.map(r => {
                  const isSelected = reason === r.id;
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      className={cn(
                        "cursor-pointer relative p-3 rounded-xl border transition-all duration-200 group hover:bg-background/80",
                        isSelected
                          ? "bg-primary/5 border-primary/50 shadow-sm"
                          : "bg-background/40 border-border/40 hover:border-border/60",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={cn(
                            "w-4 h-4 mt-0.5 transition-colors",
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground",
                          )}
                        />
                        <div>
                          <p
                            className={cn(
                              "text-xs font-medium transition-colors",
                              isSelected
                                ? "text-primary dark:text-primary-foreground"
                                : "text-foreground",
                            )}
                          >
                            {r.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                Note
              </Label>
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="bg-background/50 border-border/50 min-h-[80px] resize-none focus:border-primary/50 rounded-xl text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Historique */}
            <div className="pt-6 border-t border-border/40">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                <HistoryIcon className="w-3 h-3" />
                Historique Récent
              </h4>

              <div className="relative">
                <div className="absolute left-[19px] top-2 bottom-0 w-px bg-border/50" />

                {loadingHistory ? (
                  <div className="py-8 text-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto opacity-50"></div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground italic">
                    Aucun historique disponible
                  </div>
                ) : (
                  <div className="space-y-6">
                    {history.slice(0, 5).map((h, i) => (
                      <div key={i} className="relative flex gap-4 group">
                        <div className="mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-background bg-border group-hover:bg-primary group-hover:scale-125 transition-all z-10 mx-3.5 shrink-0 shadow-sm" />

                        <div className="flex-1 pb-1">
                          <div className="flex justify-between items-start">
                            <span
                              className={cn(
                                "text-sm font-bold font-mono",
                                h.quantity > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400",
                              )}
                            >
                              {h.quantity > 0 ? "+" : ""}
                              {h.quantity}
                            </span>
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {new Date(h.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-foreground mt-1 font-medium">
                            {h.reason}
                          </p>
                          {h.note && (
                            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 border-l-2 border-border pl-2">
                              {h.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Fixe */}
        <div className="p-6 bg-background/80 backdrop-blur-md border-t border-border/40 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-muted-foreground">Stock actuel</span>
            <span className="text-sm font-mono font-medium">{item.stock}</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-border/50 bg-background/50"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={submitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              {submitting ? "Sauvegarde..." : "Confirmer Ajustement"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
