"use client";

import React from "react";
import { PromoCode, DiscountType } from "../../types";
import { formatPrice } from "@/lib/formatPrice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Copy, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PromoCodeTableProps {
  data: PromoCode[];
  onEdit: (code: PromoCode) => void;
  onDelete: (id: number) => void;
}

export function PromoCodeTable({
  data,
  onEdit,
  onDelete,
}: PromoCodeTableProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copié !");
  };

  const getStatusBadge = (code: PromoCode) => {
    const now = new Date();
    const startDate = code.startDate ? new Date(code.startDate) : null;
    const endDate = code.endDate ? new Date(code.endDate) : null;

    if (!code.isActive) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-500">
          Inactif
        </Badge>
      );
    }

    if (endDate && endDate < now) {
      return (
        <Badge
          variant="destructive"
          className="bg-rose-100 text-rose-600 border-rose-200"
        >
          Expiré
        </Badge>
      );
    }

    if (startDate && startDate > now) {
      return (
        <Badge
          variant="outline"
          className="text-amber-600 border-amber-200 bg-amber-50"
        >
          Planifié
        </Badge>
      );
    }

    if (code.usageLimit && code.usageCount >= code.usageLimit) {
      return (
        <Badge
          variant="destructive"
          className="bg-orange-100 text-orange-600 border-orange-200"
        >
          Épuisé
        </Badge>
      );
    }

    return (
      <Badge className="bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-100">
        Actif
      </Badge>
    );
  };

  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Réduction</TableHead>
            <TableHead>Utilisation</TableHead>
            <TableHead>Validité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(code => (
            <TableRow
              key={code.id}
              className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                    {code.code}
                  </span>
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-500 transition-opacity"
                    title="Copier"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </TableCell>

              <TableCell>
                <div className="font-bold text-gray-900 dark:text-gray-100">
                  {code.type === DiscountType.PERCENTAGE
                    ? `-${code.value}%`
                    : `-${formatPrice(code.value)}`}
                </div>
                {code.minOrderAmount && (
                  <div className="text-xs text-gray-500">
                    Min. {formatPrice(code.minOrderAmount)}
                  </div>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {code.usageCount}
                    <span className="text-gray-400">
                      {" / "}
                      {code.usageLimit === null ? "∞" : code.usageLimit}
                    </span>
                  </span>
                  {/* Simple progress bar if limit exists */}
                  {code.usageLimit && (
                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${Math.min((code.usageCount / code.usageLimit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-xs text-gray-500 space-y-1">
                  {code.startDate && (
                    <div>
                      Du:{" "}
                      {format(new Date(code.startDate), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </div>
                  )}
                  {code.endDate ? (
                    <div
                      className={
                        new Date(code.endDate) < new Date()
                          ? "text-rose-500 font-medium"
                          : ""
                      }
                    >
                      Au:{" "}
                      {format(new Date(code.endDate), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400">Pas de fin</span>
                  )}
                </div>
              </TableCell>

              <TableCell>{getStatusBadge(code)}</TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    onClick={() => onEdit(code)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      if (
                        confirm(
                          "Êtes-vous sûr de vouloir supprimer ce code promo ?",
                        )
                      ) {
                        onDelete(code.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                Aucun code promo trouvé. Créez-en un pour commencer !
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
