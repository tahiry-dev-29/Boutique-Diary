"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Category } from "@/types/category";

interface CategoryFormProps {
  category: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<Category>({
    name: "",
    description: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        slug: category.slug,
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validation basique
      if (!formData.name) {
        setError("Veuillez remplir le nom de la catégorie.");
        setLoading(false);
        return;
      }

      const url = category?.id
        ? `/api/categories/${category.id}`
        : "/api/categories";
      const method = category?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      if (response.ok) {
        toast.success(
          category
            ? "Catégorie modifiée avec succès"
            : "Catégorie créée avec succès"
        );
        onSuccess();
        if (!category) {
          setFormData({ name: "", description: "", slug: "" });
        }
      } else {
        const data = await response.json();
        toast.error(data.error || "Une erreur est survenue");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-lg border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        {category?.id ? "Modifier la catégorie" : "Nouvelle catégorie"}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e /*  */) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Enregistrement..."
            : category?.id
              ? "Mettre à jour"
              : "Créer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
