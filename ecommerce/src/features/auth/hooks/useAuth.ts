"use client";

import { useState } from "react";
import { toast } from "sonner";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur de connexion");
        toast.error(data.error || "Erreur de connexion");
        return false;
      }

      toast.success("Connexion réussie");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    credentials: RegisterCredentials,
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        toast.error(data.error || "Erreur lors de l'inscription");
        return false;
      }

      toast.success("Inscription réussie");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Déconnexion réussie");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
