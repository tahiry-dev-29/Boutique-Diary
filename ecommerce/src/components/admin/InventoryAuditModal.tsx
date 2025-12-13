"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xl sm:rounded-2xl border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row h-[700px]">
          {/* LEFT: ACTION PANEL (60%) */}
          <div className="flex-[3] p-8 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 relative bg-gray-100 dark:bg-gray-800">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-xl font-medium tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <ArrowRightLeft className="w-5 h-5 text-primary" />
                </div>
                Ajustement de Stock
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8 flex-1 overflow-y-auto pr-2">
              {/* 1. Main Input Section */}
              <div className="grid grid-cols-2 gap-6 items-end">
                <div className="space-y-3">
                  <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    Stock Physique
                  </Label>
                  <div className="relative group">
                    <Input
                      type="number"
                      value={physicalCount}
                      onChange={e => setPhysicalCount(e.target.value)}
                      className="h-16 text-4xl font-bold bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-primary/50 focus:ring-0 transition-all rounded-xl px-4 text-gray-900 dark:text-white placeholder:text-gray-400 font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    Écart / Gap
                  </Label>
                  <div
                    className={cn(
                      "h-16 flex items-center justify-center rounded-xl border border-dashed transition-all",
                      discrepancy === 0
                        ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-400"
                        : discrepancy > 0
                          ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                          : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
                    )}
                  >
                    <span className="text-2xl font-bold mono">
                      {discrepancy > 0 ? "+" : ""}
                      {discrepancy}
                    </span>
                    <span className="ml-2 text-sm font-medium opacity-70">
                      Unités
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Reasons Grid (Bento) */}
              <div className="space-y-3">
                <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
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
                          "cursor-pointer relative p-4 rounded-xl border transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-gray-700",
                          isSelected
                            ? "bg-primary/5 border-primary/50 shadow-sm"
                            : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Icon
                            className={cn(
                              "w-5 h-5 mt-0.5 transition-colors",
                              isSelected
                                ? "text-primary"
                                : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300",
                            )}
                          />
                          <div>
                            <p
                              className={cn(
                                "text-sm font-medium transition-colors",
                                isSelected
                                  ? "text-primary dark:text-primary-foreground"
                                  : "text-gray-700 dark:text-gray-300",
                              )}
                            >
                              {r.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {r.desc}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-4 right-4 text-primary">
                              <Check size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Note */}
              <div className="space-y-3">
                <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  Note
                </Label>
                <Textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 min-h-[100px] resize-none focus:border-primary/50 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Système: {item.stock} → Nouveau: {currentVal}
              </span>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  onClick={onClose}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={submitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                >
                  {submitting ? "Sauvegarde..." : "Confirmer"}
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTEXT PANEL (40%) */}
          <div className="flex-[2] bg-gray-50 dark:bg-gray-900/50 p-8 flex flex-col border-l border-gray-200 dark:border-gray-700 relative overflow-hidden">
            {/* Product Card */}
            <div className="relative mb-8 p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate text-base">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 font-normal tracking-wide"
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

            {/* History Timeline */}
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                <HistoryIcon className="w-3 h-3" />
                Historique
              </h4>

              <div className="flex-1 overflow-y-auto pr-2 relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-2 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

                {loadingHistory ? (
                  <div className="py-8 text-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto opacity-50"></div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 text-sm text-gray-400 italic">
                    Aucun historique disponible
                  </div>
                ) : (
                  <div className="space-y-6">
                    {history.map((h, i) => (
                      <div key={i} className="relative flex gap-4 group">
                        {/* Dot */}
                        <div className="mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 group-hover:bg-primary group-hover:scale-125 transition-all z-10 mx-3.5 shrink-0 shadow-sm" />

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
                            <span className="text-[10px] text-gray-400 tabular-nums">
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
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                            {h.reason}
                          </p>
                          {h.note && (
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                              {h.note}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-700 text-[8px] flex items-center justify-center text-gray-500 font-bold border border-gray-200 dark:border-gray-600">
                              {(h.createdBy || "A").charAt(0)}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {h.createdBy || "Admin"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
