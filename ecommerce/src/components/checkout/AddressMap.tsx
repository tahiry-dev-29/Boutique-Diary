"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddressMapProps {
  onAddressSelect: (
    address: string,
    latLng: { lat: number; lng: number },
  ) => void;
}

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  loading: () => (
    <div className="h-[300px] w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  ),
  ssr: false,
});

const DEFAULT_CENTER = { lat: -18.8792, lng: 47.5079 };

export default function AddressMap({ onAddressSelect }: AddressMapProps) {
  const [coords, setCoords] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(false);

  const [debouncedCoords, setDebouncedCoords] = useState(coords);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCoords(coords);
    }, 1500);
    return () => clearTimeout(timer);
  }, [coords]);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/geocode/reverse?lat=${debouncedCoords.lat}&lng=${debouncedCoords.lng}`,
        );

        if (!response.ok) {
          // 503 is temporary - don't show error, next debounce will retry
          if (response.status === 503) {
            console.warn(
              "[AddressMap] Service unavailable, will retry on next move",
            );
            return;
          }
          if (response.status === 429) {
            toast.error("Trop de requêtes. Veuillez patienter un instant.");
            return;
          }
          console.error(`[AddressMap] API error ${response.status}`);
          return;
        }

        const data = await response.json();

        if (data && (data.display_name || data.address)) {
          const address =
            data.display_name ||
            (data.address
              ? Object.values(data.address).join(", ")
              : "Adresse inconnue");
          onAddressSelect(address, debouncedCoords);
        }
      } catch (error) {
        console.error("[AddressMap] Geocoding error:", error);
        // Silent fail - user can retry by moving the map
      } finally {
        setLoading(false);
      }
    };

    if (debouncedCoords) {
      fetchAddress();
    }
  }, [debouncedCoords, onAddressSelect]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <LeafletMap
          defaultCenter={DEFAULT_CENTER}
          onCenterChange={(lat, lng) => setCoords({ lat, lng })}
        />
        {loading && (
          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-sm text-xs font-medium flex items-center gap-2 z-[1001]">
            <Loader2 className="w-3 h-3 animate-spin" />
            Chargement...
          </div>
        )}
      </div>
    </div>
  );
}
