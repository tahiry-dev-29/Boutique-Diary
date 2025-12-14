"use client";

import React from "react";
import { PromotionRule } from "../../types";
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
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PromotionTableProps {
  data: PromotionRule[];
  onEdit: (rule: PromotionRule) => void;
  onDelete: (id: number) => void;
}

export function PromotionTable({
  data,
  onEdit,
  onDelete,
}: PromotionTableProps) {
  const getStatusBadge = (rule: PromotionRule) => {
    if (!rule.isActive)
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-500">
          Inactif
        </Badge>
      );

    const now = new Date();
    if (rule.startDate && new Date(rule.startDate) > now)
      return (
        <Badge
          variant="outline"
          className="text-amber-600 border-amber-200 bg-amber-50"
        >
          Planifié
        </Badge>
      );
    if (rule.endDate && new Date(rule.endDate) < now)
      return (
        <Badge
          variant="destructive"
          className="bg-rose-100 text-rose-600 border-rose-200"
        >
          Expiré
        </Badge>
      );

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
            <TableHead className="w-[80px]">Priorité</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Validité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(rule => (
            <TableRow
              key={rule.id}
              className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <TableCell>
                <div className="font-mono text-center bg-gray-100 dark:bg-gray-800 rounded w-8 h-8 flex items-center justify-center text-sm font-medium">
                  {rule.priority}
                </div>
              </TableCell>
              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                {rule.name}
              </TableCell>

              <TableCell>
                <div className="text-xs text-gray-500 space-y-1">
                  {rule.startDate && (
                    <div>
                      Du:{" "}
                      {format(new Date(rule.startDate), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </div>
                  )}
                  {rule.endDate ? (
                    <div
                      className={
                        new Date(rule.endDate) < new Date()
                          ? "text-rose-500 font-medium"
                          : ""
                      }
                    >
                      Au:{" "}
                      {format(new Date(rule.endDate), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400">Toujours valide</span>
                  )}
                </div>
              </TableCell>

              <TableCell>{getStatusBadge(rule)}</TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    onClick={() => onEdit(rule)}
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
                          "Êtes-vous sûr de vouloir supprimer cette règle ?",
                        )
                      ) {
                        onDelete(rule.id);
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
              <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                Aucune règle de promotion.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
