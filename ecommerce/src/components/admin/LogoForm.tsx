"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, Trash2, Save } from "lucide-react";

export default function LogoForm() {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger le logo actuel
  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await fetch("/api/settings?key=logo");
      if (response.ok) {
        const data = await response.json();
        if (data && data.value) {
          setLogoUrl(data.value);
          setPreviewUrl(data.value);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du logo:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Erreur upload");
      }

      const { url } = await uploadResponse.json();
      setLogoUrl(url);
      setPreviewUrl(url);
      toast.success("Image uploadée avec succès");
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error("Erreur lors de l'upload de l'image");
      setPreviewUrl(logoUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!previewUrl) {
      toast.error("Veuillez d'abord uploader un logo");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "logo", value: previewUrl }),
      });

      if (response.ok) {
        setLogoUrl(previewUrl);
        toast.success("Logo enregistré avec succès");

        window.location.reload();
      } else {
        throw new Error("Erreur sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'enregistrement du logo");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!logoUrl) return;

    setLoading(true);
    try {
      const response = await fetch("/api/settings?key=logo", {
        method: "DELETE",
      });

      if (response.ok) {
        setLogoUrl("");
        setPreviewUrl("");
        toast.success("Logo supprimé");
        window.location.reload();
      } else {
        throw new Error("Erreur suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression du logo");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Logo du site
        </h2>
        <p className="text-gray-600 text-sm">
          Uploadez votre logo. Il sera affiché dans le header du site et le
          dashboard admin.
        </p>
      </div>

      {}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
        {previewUrl ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative w-48 h-24 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Logo preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">Logo actuel</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-500">Cliquez ou glissez une image ici</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Upload en cours..." : "Choisir une image"}
        </button>
      </div>

      {}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading || !previewUrl}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Enregistrer
        </button>

        {logoUrl && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
