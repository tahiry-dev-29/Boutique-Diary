"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { X, Upload, Plus, Image as ImageIcon } from "lucide-react";
import { Product } from "@/types/admin";
import { Category } from "@/types/category";

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: "",
    description: "",
    reference: "",
    images: [],
    price: 0,
    stock: 0,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();

    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        reference: product.reference,
        images: product.images || [],
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId || null,
      });
    }
  }, [product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 6 - formData.images.length;
    if (remainingSlots === 0) {
      toast.error("Maximum 6 images autorisées");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const validFiles: File[] = [];

    // Validate all files first
    for (const file of filesToProcess) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} n'est pas une image valide`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dépasse 5MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Process all valid files
    const base64Promises = validFiles.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () =>
          reject(new Error(`Erreur lors de la lecture de ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    try {
      const base64Strings = await Promise.all(base64Promises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...base64Strings],
      }));
      toast.success(`${base64Strings.length} image(s) ajoutée(s)`);
    } catch (error) {
      toast.error("Erreur lors de la lecture des fichiers");
    }

    // Reset input
    e.target.value = "";
  };

  const handleAddUrl = async () => {
    if (!urlInput) return;

    if (formData.images.length >= 6) {
      toast.error("Maximum 6 images autorisées");
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading("Téléchargement de l'image...");

    try {
      const response = await fetch("/api/upload-url-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erreur lors du téléchargement");
        toast.dismiss(loadingToast);
        return;
      }

      // Add the local path to images
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.path],
      }));

      toast.success("Image téléchargée avec succès");
      toast.dismiss(loadingToast);
      setUrlInput("");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
      toast.dismiss(loadingToast);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...formData.images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !formData.name ||
        !formData.reference ||
        isNaN(formData.price) ||
        formData.price < 0 ||
        isNaN(formData.stock) ||
        formData.stock < 0
      ) {
        toast.error(
          "Veuillez remplir tous les champs obligatoires correctement."
        );
        setLoading(false);
        return;
      }

      const url = product?.id ? `/api/products/${product.id}` : "/api/products";
      const method = product?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          product?.id
            ? "Produit modifié avec succès"
            : "Produit créé avec succès"
        );
        onSuccess();
        if (!product?.id) {
          setFormData({
            name: "",
            description: "",
            reference: "",
            images: [],
            price: 0,
            stock: 0,
          });
        }
      } else {
        const data = await response.json();
        toast.error(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Une erreur est survenue lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg border border-gray-200"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {product?.id ? "Modifier le produit" : "Nouveau produit"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Référence *
            </label>
            <input
              type="text"
              required
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={formData.categoryId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoryId: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Non classé</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (Ar) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={isNaN(formData.price) ? "" : formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                value={isNaN(formData.stock) ? "" : formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Galerie d images (Max 6)
          </label>

          {/* Add Image Controls */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="URL de l'image..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={!urlInput || formData.images.length >= 6}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
            <label
              className={`cursor-pointer px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 flex items-center ${formData.images.length >= 6 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Upload className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={formData.images.length >= 6}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Gallery Layout */}
          <div className="space-y-4">
            {/* Main Image Display */}
            <div className="relative w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
              {formData.images[0] ? (
                <>
                  <img
                    src={formData.images[0]}
                    alt="Image principale"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow z-10">
                    Image Principale
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(0)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-2" />
                  <span className="text-sm">Aucune image principale</span>
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            <div className="grid grid-cols-6 gap-2">
              {/* Slots for images 1-6 (Index 0 is main, so we show 0-5 in thumbnails? 
                  The user wants to click a thumbnail to make it main. 
                  Usually this means showing ALL images in the thumbnail row, including the main one, 
                  OR showing the "rest" of the images.
                  The reference image shows the main image repeated in the thumbnails row with a highlight.
                  Let's show ALL images in the row to allow selection.
              */}
              {formData.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => handleSetMainImage(index)}
                  className={`relative aspect-square bg-gray-50 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    index === 0
                      ? "border-indigo-600 ring-2 ring-indigo-100"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Vue ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {/* Empty slots placeholders if less than 6 images */}
              {Array.from({
                length: Math.max(0, 6 - formData.images.length),
              }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300"
                >
                  <span className="text-xs">
                    {formData.images.length + i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Enregistrement..."
            : product?.id
              ? "Mettre à jour"
              : "Créer le produit"}
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
