import { useState, useEffect } from "react";
import { ProductReportResponse } from "../types/products";

interface FetchState {
  data: ProductReportResponse | null;
  loading: boolean;
  error: string | null;
}

export function useFetchProductReports() {
  const [state, setState] = useState<FetchState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/reports/products");
        if (!res.ok) {
          throw new Error(
            "Erreur lors de la récupération des données produits",
          );
        }
        const jsonData = await res.json();
        setState({ data: jsonData, loading: false, error: null });
      } catch (err: any) {
        setState({
          data: null,
          loading: false,
          error: err.message || "Une erreur est survenue",
        });
      }
    }

    fetchData();
  }, []);

  return state;
}
