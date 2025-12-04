"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { X, Upload, Plus, Image as ImageIcon } from "lucide-react";
import { Product } from "@/types/admin";
import { Category } from "@/types/category";
import { AVAILABLE_COLORS, AVAILABLE_SIZES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

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
    brand: "",
    colors: [],
    sizes: [],
    isNew: false,
    isPromotion: false,
    isBestSeller: false,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [urlInput, setUrlInput] = useState("");

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
        // Map existing images to the new structure if they are just strings
        images:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          product.images?.map((img: any) =>
            typeof img === "string" ? { url: img, color: null, sizes: [] } : img
          ) || [],
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId || null,
        brand: product.brand || "",
        colors: product.colors || [],
        sizes: product.sizes || [],
        isNew: product.isNew || false,
        isPromotion: product.isPromotion || false,
        isBestSeller: product.isBestSeller || false,
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
      const newImages = base64Strings.map((url) => ({
        url,
        color: null,
        sizes: [],
      }));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      toast.success(`${base64Strings.length} image(s) ajoutée(s)`);
    } catch {
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
        images: [...prev.images, { url: data.path, color: null, sizes: [] }],
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
    // Adjust selectedImageIndex if the removed image was before it
    if (selectedImageIndex >= index && selectedImageIndex > 0) {
      setSelectedImageIndex((prev) => prev - 1);
    } else if (selectedImageIndex === index && formData.images.length === 1) {
      // If the last image is removed, reset selected index
      setSelectedImageIndex(0);
    } else if (
      selectedImageIndex === index &&
      index === formData.images.length - 1
    ) {
      // If the last image is removed and it was selected, select the new last image
      setSelectedImageIndex(formData.images.length - 2);
    }
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...formData.images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setFormData((prev) => ({ ...prev, images: newImages }));
    setSelectedImageIndex(0); // After setting a new main image, select it
  };

  const handleUpdateImageAttribute = (
    index: number,
    field: "color" | "sizes" | "price",
    value: string | string[] | number | null
  ) => {
    const newImages = [...formData.images];
    if (newImages[index]) {
      newImages[index] = {
        ...newImages[index],
        [field]: value || (field === "sizes" ? [] : null),
      };
      setFormData({ ...formData, images: newImages });
    }
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
            brand: "",
            colors: [],
            sizes: [],
            isNew: false,
            isPromotion: false,
            isBestSeller: false,
          });
          setSelectedImageIndex(0); // Reset selected image index for new product
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
        {/* Left Column - All Data Fields */}
        <div className="space-y-4">
          {/* Name and Reference */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Category and Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={formData.categoryId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryId: e.target.value
                      ? parseInt(e.target.value)
                      : null,
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marque
              </label>
              <input
                type="text"
                value={formData.brand || ""}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleurs
              </label>
              <select
                onChange={(e) => {
                  if (
                    e.target.value &&
                    !formData.colors?.includes(e.target.value)
                  ) {
                    setFormData({
                      ...formData,
                      colors: [...(formData.colors || []), e.target.value],
                    });
                  }
                  e.target.value = "";
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Ajouter une couleur</option>
                {AVAILABLE_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.colors?.map((color) => (
                  <Badge
                    key={color}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {color}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          colors: formData.colors?.filter((c) => c !== color),
                        })
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tailles
              </label>
              <select
                onChange={(e) => {
                  if (
                    e.target.value &&
                    !formData.sizes?.includes(e.target.value)
                  ) {
                    setFormData({
                      ...formData,
                      sizes: [...(formData.sizes || []), e.target.value],
                    });
                  }
                  e.target.value = "";
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Ajouter une taille</option>
                {AVAILABLE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.sizes?.map((size) => (
                  <Badge
                    key={size}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {size}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          sizes: formData.sizes?.filter((s) => s !== size),
                        })
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Type de produit
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNew || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isNew: e.target.checked })
                  }
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Nouveau</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPromotion || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isPromotion: e.target.checked })
                  }
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Promotion</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestSeller || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isBestSeller: e.target.checked })
                  }
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Best-seller</span>
              </label>
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

        {/* Right Column - Images */}

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Galerie d&apos;images (Max 6)
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
              {formData.images[selectedImageIndex] ? (
                <>
                  <img
                    src={formData.images[selectedImageIndex].url}
                    alt="Image principale"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow z-10">
                    {selectedImageIndex === 0
                      ? "Image Principale"
                      : `Image ${selectedImageIndex + 1}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(selectedImageIndex)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-2" />
                  <span className="text-sm">Aucune image sélectionnée</span>
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            <div className="grid grid-cols-6 gap-2">
              {formData.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square bg-gray-50 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    index === selectedImageIndex
                      ? "border-indigo-600 ring-2 ring-indigo-100"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Vue ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[8px] text-center py-0.5">
                      MAIN
                    </div>
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

            {/* Image Attributes Settings */}
            {formData.images[selectedImageIndex] && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Paramètres de l&apos;image {selectedImageIndex + 1}
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Couleur associée
                    </label>
                    <select
                      value={formData.images[selectedImageIndex].color || ""}
                      onChange={(e) =>
                        handleUpdateImageAttribute(
                          selectedImageIndex,
                          "color",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Aucune</option>
                      {formData.colors?.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Prix (Ar)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={`${formData.price} Ar (défaut)`}
                      value={formData.images[selectedImageIndex].price || ""}
                      onChange={(e) =>
                        handleUpdateImageAttribute(
                          selectedImageIndex,
                          "price",
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-400 mt-0.5">
                      Laisser vide pour utiliser le prix par défaut
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tailles associées
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.sizes?.map((size) => (
                        <label
                          key={size}
                          className="flex items-center gap-1 text-xs cursor-pointer bg-white px-2 py-1 rounded border border-gray-200 hover:border-indigo-300"
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.images[
                                selectedImageIndex
                              ].sizes?.includes(size) || false
                            }
                            onChange={(e) => {
                              const currentSizes =
                                formData.images[selectedImageIndex].sizes || [];
                              const newSizes = e.target.checked
                                ? [...currentSizes, size]
                                : currentSizes.filter((s) => s !== size);
                              handleUpdateImageAttribute(
                                selectedImageIndex,
                                "sizes",
                                newSizes
                              );
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                          />
                          {size}
                        </label>
                      ))}
                    </div>
                    {(!formData.sizes || formData.sizes.length === 0) && (
                      <p className="text-xs text-gray-400 italic">
                        Aucune taille définie pour le produit
                      </p>
                    )}
                  </div>
                </div>
                {selectedImageIndex !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetMainImage(selectedImageIndex)}
                    className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Définir comme image principale
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Buttons at bottom of image section */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-[300px] bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </form>
  );
}
