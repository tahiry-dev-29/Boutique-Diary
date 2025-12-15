import { useState, useEffect, useCallback } from "react";
import { PromoCode } from "../types";
import { toast } from "sonner";

export function usePromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/marketing/promo-codes");
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setPromoCodes(data);
    } catch (err) {
      setError("Impossible de charger les codes promo");
      // toast.error("Erreur de chargement des codes promo"); // Optional: prevent toast spam on mount
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const createPromoCode = async (data: Partial<PromoCode>) => {
    try {
      const res = await fetch("/api/admin/marketing/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur de création");
      }

      await fetchPromoCodes();
      toast.success("Code promo créé avec succès");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
      return false;
    }
  };

  const updatePromoCode = async (id: number, data: Partial<PromoCode>) => {
    try {
      const res = await fetch(`/api/admin/marketing/promo-codes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur de mise à jour");
      }

      await fetchPromoCodes();
      toast.success("Code promo mis à jour");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour");
      return false;
    }
  };

  const deletePromoCode = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/marketing/promo-codes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur de suppression");

      setPromoCodes(prev => prev.filter(code => code.id !== id));
      toast.success("Code promo supprimé");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
      return false;
    }
  };

  return {
    promoCodes,
    loading,
    error,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    refresh: fetchPromoCodes,
  };
}
