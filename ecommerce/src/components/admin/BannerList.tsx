"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Banner } from "@/types/banner";

interface BannerListProps {
  onEdit: (banner: Banner) => void;
  refreshTrigger: number;
}

export default function BannerList({
  onEdit,
  refreshTrigger,
}: BannerListProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/banners");
      if (!response.ok) throw new Error("Erreur de chargement");
      const data = await response.json();
      setBanners(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des bannières");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette bannière ?")) return;

    try {
      const response = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erreur de suppression");
      setBanners(banners.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression");
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      });
      if (!response.ok) throw new Error("Erreur de mise à jour");

      setBanners(
        banners.map(b =>
          b.id === banner.id ? { ...b, isActive: !b.isActive } : b,
        ),
      );
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-sm">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Aucune bannière
        </h3>
        <p className="mt-2 text-gray-500">
          Créez votre première bannière pour la page d&apos;accueil.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {banners.map(banner => (
        <div
          key={banner.id}
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden transition-all ${
            !banner.isActive ? "opacity-60" : ""
          }`}
        >
          {}
          <div className="relative h-48 bg-gray-100">
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 left-2 flex gap-2">
              <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                #{banner.order}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  banner.isActive
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {banner.isActive ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>

          {}
          <div className="p-4">
            <h3 className="font-bold text-gray-800 truncate">{banner.title}</h3>
            {banner.subtitle && (
              <p className="text-sm text-teal-600 truncate">
                {banner.subtitle}
              </p>
            )}
            {banner.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {banner.description}
              </p>
            )}
            {banner.buttonText && (
              <p className="mt-2 text-xs text-gray-500">
                Bouton: {banner.buttonText} → {banner.buttonLink}
              </p>
            )}
          </div>

          {}
          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={() => toggleActive(banner)}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                banner.isActive
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {banner.isActive ? "Désactiver" : "Activer"}
            </button>
            <button
              onClick={() => onEdit(banner)}
              className="flex-1 py-2 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={() => handleDelete(banner.id)}
              className="py-2 px-3 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
