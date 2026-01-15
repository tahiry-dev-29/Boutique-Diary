"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  CheckCircle2,
  MoreVertical,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { StoreTheme } from "@/lib/theme/theme-config";
import {
  activateThemeAction,
  deleteThemeAction,
} from "@/app/admin/appearance/theme/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ThemeListProps {
  themes: (StoreTheme & { id: number; isActive: boolean })[];
}

export function ThemeList({ themes }: ThemeListProps) {
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const router = useRouter();

  const handleActivate = async (id: number) => {
    setIsUpdating(id);
    try {
      const result = await activateThemeAction(id);
      if (result.success) {
        toast.success("Thème activé");
        router.refresh();
      }
    } catch (error) {
      toast.error("Erreur d'activation");
      console.error(error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce thème ?")) return;
    try {
      const result = await deleteThemeAction(id);
      if (result.success) {
        toast.success("Thème déplacé dans la corbeille");
        router.refresh();
      }
    } catch (error) {
      toast.error("Erreur de suppression");
      console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {themes.map(theme => (
        <Card
          key={theme.id}
          className={cn(
            "overflow-hidden border-2 transition-all duration-300 hover:shadow-xl group",
            theme.isActive
              ? "border-primary shadow-lg shadow-primary/5"
              : "border-gray-100 hover:border-gray-200",
          )}
        >
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 bg-gray-50/30">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold truncate max-w-[150px]">
                {theme.name}
              </CardTitle>
              {theme.isActive && (
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-2 py-0 h-5 text-[10px] uppercase tracking-tighter">
                  Actif
                </Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/appearance/theme?view=customize&id=${theme.id}`}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Modifier
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "text-destructive focus:text-destructive",
                    theme.name === "Boutique Originale" &&
                      "opacity-50 cursor-not-allowed",
                  )}
                  onClick={() => {
                    if (theme.name === "Boutique Originale") {
                      toast.error(
                        "Le thème 'Boutique Originale' ne peut pas être supprimé.",
                      );
                      return;
                    }
                    handleDelete(theme.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-2">
              <div
                className="w-full h-12 rounded-lg shadow-sm border border-black/5"
                style={{ backgroundColor: theme.primaryColor }}
              />
              <div
                className="w-full h-12 rounded-lg shadow-sm border border-black/5"
                style={{ backgroundColor: theme.secondaryColor }}
              />
              <div
                className="w-full h-12 rounded-lg shadow-sm border border-black/5"
                style={{ backgroundColor: theme.accentColor }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
              <div className="space-y-1">
                <span>Titres</span>
                <p
                  className="text-gray-900 normal-case font-medium truncate"
                  style={{ fontFamily: theme.fontHeading }}
                >
                  {theme.fontHeading}
                </p>
              </div>
              <div className="space-y-1">
                <span>Corps</span>
                <p
                  className="text-gray-900 normal-case font-medium truncate"
                  style={{ fontFamily: theme.fontBody }}
                >
                  {theme.fontBody}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            {!theme.isActive && (
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-full gap-2 border-2 text-xs font-bold uppercase tracking-wider"
                onClick={() => handleActivate(theme.id)}
                disabled={isUpdating === theme.id}
              >
                {isUpdating === theme.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Activer ce thème
              </Button>
            )}
            {theme.isActive && (
              <Button
                size="sm"
                variant="secondary"
                className="w-full rounded-full gap-2 text-xs font-bold uppercase tracking-wider"
                disabled
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Utilisé actuellement
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
