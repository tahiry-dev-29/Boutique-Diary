"use client";

import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

interface LeafletMapProps {
  onCenterChange: (lat: number, lng: number) => void;
  defaultCenter: { lat: number; lng: number };
}

function MapController({
  onCenterChange,
}: {
  onCenterChange: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onCenterChange(center.lat, center.lng);
    },
  });

  return null;
}

export default function LeafletMap({
  onCenterChange,
  defaultCenter,
}: LeafletMapProps) {
  return (
    <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-gray-200 z-0">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController onCenterChange={onCenterChange} />
      </MapContainer>

      {}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none mb-4">
        <div className="relative">
          <div className="w-8 h-8 text-red-600 drop-shadow-lg scale-110">
            <MapPin className="w-full h-full fill-current" />
          </div>
          <div className="w-2 h-1 bg-black/20 rounded-[50%] absolute -bottom-1 left-1/2 -translate-x-1/2 blur-[1px]" />
        </div>
      </div>

      {}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-white shadow-sm text-xs text-center text-gray-600 z-[1000]">
        Déplacez la carte pour positionner le repère
      </div>
    </div>
  );
}
