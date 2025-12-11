"use client";

import { useState, useCallback, useEffect } from "react";
import { Product } from "@/types/admin";
import { toast } from "sonner";

interface UseProductsOptions {
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  deleteProduct: (id: number) => Promise<boolean>;
  createProduct: (data: Partial<Product>) => Promise<Product | null>;
  updateProduct: (
    id: number,
    data: Partial<Product>,
  ) => Promise<Product | null>;
  refresh: () => Promise<void>;
}

export function useProducts(
  options: UseProductsOptions = {},
): UseProductsReturn {
  const { autoFetch = true } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des produits");
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produit supprimé avec succès");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(message);
      return false;
    }
  }, []);

  const createProduct = useCallback(
    async (data: Partial<Product>): Promise<Product | null> => {
      try {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création");
        }

        const newProduct = await response.json();
        setProducts((prev) => [...prev, newProduct]);
        toast.success("Produit créé avec succès");
        return newProduct;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        toast.error(message);
        return null;
      }
    },
    [],
  );

  const updateProduct = useCallback(
    async (id: number, data: Partial<Product>): Promise<Product | null> => {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour");
        }

        const updatedProduct = await response.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updatedProduct : p)),
        );
        toast.success("Produit mis à jour avec succès");
        return updatedProduct;
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
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    deleteProduct,
    createProduct,
    updateProduct,
    refresh: fetchProducts,
  };
}
