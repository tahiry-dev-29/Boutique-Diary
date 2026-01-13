import { useState, useEffect, useCallback } from "react";
import { PromotionRule } from "../types";
import { toast } from "sonner";

export function usePromotionRules() {
  const [rules, setRules] = useState<PromotionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/marketing/promotions");
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setRules(data);
    } catch (err) {
      setError("Impossible de charger les règles de promotion");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = async (data: Partial<PromotionRule>) => {
    try {
      const res = await fetch("/api/admin/marketing/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur de création");
      }

      await fetchRules();
      toast.success("Règle créée avec succès");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
      return false;
    }
  };

  const updateRule = async (id: number, data: Partial<PromotionRule>) => {
    try {
      const res = await fetch(`/api/admin/marketing/promotions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur de mise à jour");
      }

      await fetchRules();
      toast.success("Règle mise à jour");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour");
      return false;
    }
  };

  const deleteRule = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/marketing/promotions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur de suppression");

      setRules((prev) => prev.filter((r) => r.id !== id));
      toast.success("Règle supprimée");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
      return false;
    }
  };

  const applyRule = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/marketing/promotions/${id}/apply`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'application");

      toast.success(data.message || "Promotion appliquée avec succès");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'application");
      return false;
    }
  };

  const revertRule = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/marketing/promotions/${id}/revert`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'annulation");

      toast.success(data.message || "Promotion annulée avec succès");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'annulation");
      return false;
    }
  };

  return {
    rules,
    loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    applyRule,
    revertRule,
    refresh: fetchRules,
  };
}
