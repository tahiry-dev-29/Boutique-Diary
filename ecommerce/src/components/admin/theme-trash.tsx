"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, Trash2, Loader2 } from "lucide-react";
import {
  restoreThemeAction,
  hardDeleteThemeAction,
} from "@/app/admin/appearance/theme/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StoreTheme } from "@/lib/theme/theme-config";

interface ThemeTrashProps {
  trashedThemes: (StoreTheme & { id: number; deletedAt: Date | null })[];
}

export function ThemeTrash({ trashedThemes }: ThemeTrashProps) {
  const [isRestoring, setIsRestoring] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const router = useRouter();

  const handleRestore = async (id: number) => {
    setIsRestoring(id);
    try {
      const result = await restoreThemeAction(id);
      if (result.success) {
        toast.success("Thème restauré");
        router.refresh();
      }
    } catch (error) {
      toast.error("Erreur de restauration");
      console.error(error);
    } finally {
      setIsRestoring(null);
    }
  };

  const handleHardDelete = async (id: number) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer définitivement ce thème ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    setIsDeleting(id);
    try {
      const result = await hardDeleteThemeAction(id);
      if (result.success) {
        toast.success("Thème supprimé définitivement");
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur de suppression");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (trashedThemes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-200 animate-in fade-in duration-700">
        <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
          <History className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          La corbeille est vide
        </h3>
        <p className="text-gray-500 max-w-xs text-center italic">
          Aucun thème n&apos;a été supprimé récemment. Vos configurations sont
          en sécurité.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] border-2 border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">
              Nom du Thème
            </TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">
              Palette
            </TableHead>
            <TableHead className="font-bold uppercase tracking-widest text-[10px]">
              Supprimé le
            </TableHead>
            <TableHead className="text-right font-bold uppercase tracking-widest text-[10px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trashedThemes.map((theme) => (
            <TableRow
              key={theme.id}
              className="hover:bg-gray-50/30 transition-colors"
            >
              <TableCell className="font-bold text-sm text-gray-900">
                {theme.name}
              </TableCell>
              <TableCell>
                <div className="flex gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full border border-black/5"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-black/5"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-medium">
                {theme.deletedAt
                  ? new Date(theme.deletedAt).toLocaleDateString()
                  : "Date inconnue"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full gap-2 hover:bg-primary/10 hover:text-primary transition-all font-bold text-xs uppercase tracking-wider"
                  onClick={() => handleRestore(theme.id)}
                  disabled={isRestoring === theme.id || isDeleting === theme.id}
                >
                  {isRestoring === theme.id ? (
                    <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  Restaurer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full gap-2 hover:bg-destructive/10 hover:text-destructive transition-all font-bold text-xs uppercase tracking-wider text-destructive"
                  onClick={() => handleHardDelete(theme.id)}
                  disabled={isDeleting === theme.id || isRestoring === theme.id}
                >
                  {isDeleting === theme.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Supprimer définitivement
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
