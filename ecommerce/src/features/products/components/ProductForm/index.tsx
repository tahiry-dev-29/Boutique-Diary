"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { Product } from "@/types/admin";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ElectricButton from "@/components/ui/ElectricButton";
import { ProductFormFields } from "./ProductFormFields";
import { ProductPricing } from "./ProductPricing";
import { ProductVariants } from "./ProductVariants";
import { ProductImageUploader } from "./ProductImageUploader";

export interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialFormData: Product = {
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
  oldPrice: null,
  isBestSeller: false,
};

export default function ProductForm({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState<Product>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
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

        images:
          product.images?.map(
            (
              img:
                | string
                | { url: string; color?: string | null; sizes?: string[] },
            ) =>
              typeof img === "string"
                ? { url: img, color: null, sizes: [] }
                : img,
          ) || [],
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId || null,
        brand: product.brand || "",
        colors: product.colors || [],
        sizes: product.sizes || [],
        isNew: product.isNew || false,
        isPromotion: product.isPromotion || false,
        oldPrice: product.oldPrice || null,
        isBestSeller: product.isBestSeller || false,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !formData.name ||
        !formData.reference ||
        isNaN(formData.price) ||
        formData.price < 0 ||
        (formData.oldPrice !== null &&
          formData.oldPrice !== undefined &&
          formData.oldPrice < 0)
      ) {
        toast.error(
          "Veuillez remplir tous les champs obligatoires correctement.",
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
            : "Produit créé avec succès",
        );
        onSuccess();
        if (!product?.id) {
          setFormData(initialFormData);
          setSelectedImageIndex(0);
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
      className="space-y-6 bg-background p-6 rounded-lg border"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {product?.id ? "Modifier le produit" : "Nouveau produit"}
        </h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          <ProductFormFields
            formData={formData}
            setFormData={setFormData}
            categories={categories}
          />

          <Separator />

          <ProductPricing formData={formData} setFormData={setFormData} />

          <Separator />

          <ProductVariants formData={formData} setFormData={setFormData} />
        </div>

        {/* Right Column - Images */}
        <div className="space-y-6">
          <ProductImageUploader
            formData={formData}
            setFormData={setFormData}
            selectedImageIndex={selectedImageIndex}
            setSelectedImageIndex={setSelectedImageIndex}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <ElectricButton type="submit" disabled={loading}>
              <Save className="h-5 w-5" />
              {loading
                ? "Enregistrement..."
                : product?.id
                  ? "Mettre à jour"
                  : "Créer le produit"}
            </ElectricButton>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

// Re-export sub-components for individual use
export { ProductFormFields } from "./ProductFormFields";
export { ProductPricing } from "./ProductPricing";
export { ProductVariants } from "./ProductVariants";
export { ProductImageUploader } from "./ProductImageUploader";
