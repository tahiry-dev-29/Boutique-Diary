import { useState, useEffect } from "react";
import { SalesReportResponse } from "../types/sales";

interface FetchState {
  data: SalesReportResponse | null;
  loading: boolean;
  error: string | null;
}

export function useFetchSalesData() {
  const [state, setState] = useState<FetchState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/reports/sales");
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des données");
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
