"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface UseCustomersOptions {
  autoFetch?: boolean;
}

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  deleteCustomer: (id: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useCustomers(
  options: UseCustomersOptions = {},
): UseCustomersReturn {
  const { autoFetch = true } = options;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des clients");
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomer = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setCustomers((prev) => prev.filter((c) => c.id !== id));
      toast.success("Client supprimé avec succès");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(message);
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCustomers();
    }
  }, [autoFetch, fetchCustomers]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    deleteCustomer,
    refresh: fetchCustomers,
  };
}
