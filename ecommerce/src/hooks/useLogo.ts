"use client";

import { useState, useEffect } from "react";

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogo() {
      try {
        const response = await fetch("/api/settings?key=logo");
        if (response.ok) {
          const data = await response.json();
          if (data && data.value) {
            setLogoUrl(data.value);
          }
        }
      } catch (error) {
        console.error("Erreur chargement logo:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogo();
  }, []);

  return { logoUrl, loading };
}
