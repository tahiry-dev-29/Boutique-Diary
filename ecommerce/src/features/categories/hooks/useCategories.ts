"use client";

import { useState, useCallback, useEffect } from "react";
import { Category } from "@/types/category";
import { toast } from "sonner";

interface UseCategoriesOptions {
  autoFetch?: boolean;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  deleteCategory: (id: number) => Promise<boolean>;
  createCategory: (data: Partial<Category>) => Promise<Category | null>;
  updateCategory: (
    id: number,
    data: Partial<Category>,
  ) => Promise<Category | null>;
  refresh: () => Promise<void>;
}

export function useCategories(
  options: UseCategoriesOptions = {},
): UseCategoriesReturn {
  const { autoFetch = true } = options;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des catégories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Catégorie supprimée avec succès");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(message);
      return false;
    }
  }, []);

  const createCategory = useCallback(
    async (data: Partial<Category>): Promise<Category | null> => {
      try {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création");
        }

        const newCategory = await response.json();
        setCategories((prev) => [...prev, newCategory]);
        toast.success("Catégorie créée avec succès");
        return newCategory;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        toast.error(message);
        return null;
      }
    },
    [],
  );

  const updateCategory = useCallback(
    async (id: number, data: Partial<Category>): Promise<Category | null> => {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour");
        }

        const updatedCategory = await response.json();
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? updatedCategory : c)),
        );
        toast.success("Catégorie mise à jour avec succès");
        return updatedCategory;
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
      fetchCategories();
    }
  }, [autoFetch, fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    deleteCategory,
    createCategory,
    updateCategory,
    refresh: fetchCategories,
  };
}
