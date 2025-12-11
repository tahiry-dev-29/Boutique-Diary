"use client";

import { useState, useCallback, useEffect } from "react";
import { Banner } from "@/types/banner";
import { toast } from "sonner";

interface UseBannersOptions {
  autoFetch?: boolean;
}

interface UseBannersReturn {
  banners: Banner[];
  loading: boolean;
  error: string | null;
  fetchBanners: () => Promise<void>;
  deleteBanner: (id: number) => Promise<boolean>;
  createBanner: (data: Partial<Banner>) => Promise<Banner | null>;
  updateBanner: (id: number, data: Partial<Banner>) => Promise<Banner | null>;
  refresh: () => Promise<void>;
}

export function useBanners(options: UseBannersOptions = {}): UseBannersReturn {
  const { autoFetch = true } = options;

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/banners");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des bannières");
      }
      const data = await response.json();
      setBanners(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBanner = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bannière supprimée avec succès");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(message);
      return false;
    }
  }, []);

  const createBanner = useCallback(
    async (data: Partial<Banner>): Promise<Banner | null> => {
      try {
        const response = await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création");
        }

        const newBanner = await response.json();
        setBanners((prev) => [...prev, newBanner]);
        toast.success("Bannière créée avec succès");
        return newBanner;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        toast.error(message);
        return null;
      }
    },
    [],
  );

  const updateBanner = useCallback(
    async (id: number, data: Partial<Banner>): Promise<Banner | null> => {
      try {
        const response = await fetch(`/api/banners/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour");
        }

        const updatedBanner = await response.json();
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? updatedBanner : b)),
        );
        toast.success("Bannière mise à jour avec succès");
        return updatedBanner;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        toast.error(message);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchBanners();
    }
  }, [autoFetch, fetchBanners]);

  return {
    banners,
    loading,
    error,
    fetchBanners,
    deleteBanner,
    createBanner,
    updateBanner,
    refresh: fetchBanners,
  };
}
