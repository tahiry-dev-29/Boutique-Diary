import { useState, useEffect } from "react";
import { CustomerReportResponse } from "../types/customers";

interface FetchState {
  data: CustomerReportResponse | null;
  loading: boolean;
  error: string | null;
}

export function useFetchCustomerReports() {
  const [state, setState] = useState<FetchState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/reports/customers");
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des données clients");
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
