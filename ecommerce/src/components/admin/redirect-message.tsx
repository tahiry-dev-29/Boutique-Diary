"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const REDIRECT_MESSAGES: Record<string, string> = {
  "no-permission": "Vous n'avez pas la permission d'accéder à cette page",
  "not-authenticated": "Vous devez vous connecter pour accéder à cette page",
  "employees-access-denied": "Accès refusé à la gestion des employés",
};

export function RedirectMessage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const messageKey = searchParams.get("message");

    if (messageKey && REDIRECT_MESSAGES[messageKey]) {
      toast.error(REDIRECT_MESSAGES[messageKey]);

      
      const url = new URL(window.location.href);
      url.searchParams.delete("message");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  return null;
}
