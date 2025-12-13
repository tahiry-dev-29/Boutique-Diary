"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Save, Plus, Link } from "lucide-react";
import { Product, ProductImage } from "@/types/admin";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";

import ElectricButton from "@/components/ui/ElectricButton";
import { ProductFormFields } from "./ProductFormFields";
import { ProductPricing } from "./ProductPricing";
import { ProductVariants } from "./ProductVariants";
import { ProductImageUploader } from "./ProductImageUploader";
import { useProducts } from "../../hooks/useProducts";
import { generateRandomReference } from "@/lib/stringUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductOrganization } from "./ProductOrganization";
import { PageHeader } from "@/components/admin/PageHeader";

export interface ProductFormProps {
  product: Product | null;
  categories: Category[];
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
  categories,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  // ... state and handlers remain the same ...
  const [formData, setFormData] = useState<Product>(() => {
    if (product) {
      return {
        name: product.name,
        description: product.description || "",
        reference: product.reference,
        images:
          product.images?.map((img: string | ProductImage, index: number) =>
            typeof img === "string"
              ? {
                  url: img,
                  color: null,
                  sizes: [],
                  categoryId: index === 0 ? (product.categoryId ?? null) : null,
                  isNew: index === 0 ? (product.isNew ?? false) : false,
                  isPromotion:
                    index === 0 ? (product.isPromotion ?? false) : false,
                  oldPrice: null,
                  price: null,
                  stock: null,
                  reference: generateRandomReference(),
                }
              : {
                  ...img,
                  // Ensure created defaults if missing from API response (though schema has defaults)
                  sizes: img.sizes || [],
                  categoryId:
                    img.categoryId ??
                    (index === 0 ? (product.categoryId ?? null) : null),
                  isNew:
                    img.isNew ??
                    (index === 0 ? (product.isNew ?? false) : false),
                  isPromotion:
                    img.isPromotion ??
                    (index === 0 ? (product.isPromotion ?? false) : false),
                  oldPrice: img.oldPrice ?? null,
                  price: img.price ?? null,
                  stock: img.stock ?? null,
                  reference: img.reference || generateRandomReference(),
                },
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
      };
    }
    return {
      ...initialFormData,
      reference: generateRandomReference(),
    };
  });

  const [loading, setLoading] = useState(false);
  // Remove internal categories state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Remove fetchCategories useEffect

  // Update form data if product prop changes (e.g. re-fetch or external update)
  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        name: product.name,
        description: product.description || "",
        reference: product.reference,
        images:
          product.images?.map((img: string | ProductImage, index: number) =>
            typeof img === "string"
              ? {
                  url: img,
                  color: null,
                  sizes: [],
                  categoryId: index === 0 ? (product.categoryId ?? null) : null,
                  isNew: index === 0 ? (product.isNew ?? false) : false,
                  isPromotion:
                    index === 0 ? (product.isPromotion ?? false) : false,
                  oldPrice: null,
                  price: null,
                  stock: null,
                  reference: generateRandomReference(),
                }
              : {
                  ...img,
                  sizes: img.sizes || [],
                  categoryId:
                    img.categoryId ??
                    (index === 0 ? (product.categoryId ?? null) : null),
                  isNew:
                    img.isNew ??
                    (index === 0 ? (product.isNew ?? false) : false),
                  isPromotion:
                    img.isPromotion ??
                    (index === 0 ? (product.isPromotion ?? false) : false),
                  oldPrice: img.oldPrice ?? null,
                  price: img.price ?? null,
                  stock: img.stock ?? null,
                  reference: img.reference || generateRandomReference(),
                },
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
      }));
    }
  }, [product]);

  // Sync Global Settings from Main Image (index 0)
  // The user requested that "calculated categories" (from images) be the base.
  // We interpret this as: The Product's Category, isNew, and isPromotion status
  // should automatically match the Main Image's settings.
  useEffect(() => {
    const images = formData.images || [];
    if (images.length > 0) {
      const mainImage = images[0];
      // Check if mainImage is an object (ProductImage) and has properties
      if (typeof mainImage !== "string") {
        // Check if values differ to avoid infinite loops, although setState checks simple equality
        const newCategoryId = mainImage.categoryId ?? null;
        const newIsNew = mainImage.isNew ?? false;
        const newIsPromotion = mainImage.isPromotion ?? false;

        if (
          formData.categoryId !== newCategoryId ||
          formData.isNew !== newIsNew ||
          formData.isPromotion !== newIsPromotion
        ) {
          setFormData(prev => ({
            ...prev,
            categoryId: newCategoryId,
            isNew: newIsNew,
            isPromotion: newIsPromotion,
          }));
        }
      }
    }
  }, [formData.images]);
  // Dependency is formData.images.
  // NOTE: This might cause a re-render loop if setFormData updates images ref.
  // Ideally, we should check deep equality or only run when specific image props change.
  // But since we update `images` array reference on every image edit, this will run.
  // The condition inside `if (formData.categoryId !== ...)` protects against loop IF the setState doesn't trigger a change that re-triggers this.
  // `setFormData` updates `formData`, which triggers this effect again?
  // No, dependency is `formData.images`. If `setFormData` only updates `categoryId`, `images` ref should stay same?
  // NO. `setFormData` replaces the whole object. We need to be careful.
  // `setFormData(prev => ...)` creates a new object. `prev.images` is the SAME reference usually, UNLESS we changed images.
  // In `handleUpdateImageAttribute`, we create `newImages` array -> new reference.
  // So when Image changes -> Effect runs -> Updates Category -> New FormData (same images ref) -> Effect runs?
  // We need to ensure `images` ref is stable when we update other fields. It should be.

  const {
    createProduct,
    updateProduct,
    loading: hookLoading,
  } = useProducts({ autoFetch: false });
  // const [loading, setLoading] = useState(false); // This line is already present above, so I'll keep the existing one.

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

      let result;
      if (product?.id) {
        result = await updateProduct(product.id, formData);
      } else {
        result = await createProduct(formData);
      }

      if (result) {
        onSuccess();
        if (!product?.id) {
          setFormData(initialFormData);
          setSelectedImageIndex(0);
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title={product?.id ? "Modifier le produit" : "Ajouter un produit"}
          description="Gérer les détails du produit"
        ></PageHeader>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <ElectricButton type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading
              ? "Enregistrement..."
              : product?.id
                ? "Mettre à jour"
                : "Publier"}
          </ElectricButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (Left) - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Détails du produit</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductFormFields
                formData={formData}
                setFormData={setFormData}
                categories={categories}
              />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Images du produit</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductImageUploader
                formData={formData}
                setFormData={setFormData}
                selectedImageIndex={selectedImageIndex}
                setSelectedImageIndex={setSelectedImageIndex}
                categories={categories}
              />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductVariants formData={formData} setFormData={setFormData} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (Right) - 1/3 width */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Tarification</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductPricing formData={formData} setFormData={setFormData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

export { ProductFormFields } from "./ProductFormFields";
export { ProductPricing } from "./ProductPricing";
export { ProductVariants } from "./ProductVariants";
export { ProductImageUploader } from "./ProductImageUploader";
export { ProductOrganization } from "./ProductOrganization";
