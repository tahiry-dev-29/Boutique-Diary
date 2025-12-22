"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ArrowRight, ArrowLeft, Archive } from "lucide-react";
import { Product, ProductImage } from "@/types/admin";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";

import ElectricButton from "@/components/ui/ElectricButton";
import { ProductFormFields } from "./ProductFormFields";
import { ProductVariants } from "./ProductVariants";
import { ProductImageUploader } from "./ProductImageUploader";
import { useProducts } from "../../hooks/useProducts";
import { generateRandomReference } from "@/lib/stringUtils";
import { ProductFormStep } from "./ProductFormStep";

export interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  onSuccess?: () => void;
  onCancel?: () => void;
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
  status: "DRAFT",
};

export default function ProductForm({
  product,
  categories,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const router = useRouter();

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    else {
      router.push("/admin/products");
      router.refresh();
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.back();
  };

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
                  sizes: img.sizes || [],
                  categoryId:
                    img.categoryId ??
                    (index === 0 ? (product.categoryId ?? null) : null),
                  isNew:
                    img.isNew ??
                    (index === 0 ? (product.isNew ?? false) : false),
                  isBestSeller: img.isBestSeller ?? false,
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
        promotionRuleId: product.promotionRuleId || null,
      };
    }
    return {
      ...initialFormData,
      reference: generateRandomReference(),
    };
  });

  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Step Management
  // 1: Details, 2: Images, 3: Variants
  const [currentStep, setCurrentStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);

  // Sync with product prop changes
  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        ...product, // Simplified spread, but explicit mapping above is safer for nested structure if needed
      }));
    }
  }, [product]);

  // Sync Category from Main Image
  useEffect(() => {
    const images = formData.images || [];
    if (images.length > 0) {
      const mainImage = images[0];
      if (typeof mainImage !== "string") {
        const newCategoryId = mainImage.categoryId ?? null;
        if (formData.categoryId !== newCategoryId) {
          setFormData(prev => ({ ...prev, categoryId: newCategoryId }));
        }
      }
    }
  }, [formData.images]);

  const { createProduct, updateProduct } = useProducts({ autoFetch: false });

  const handleSubmit = async (
    e?: React.FormEvent,
    targetStatus?: "DRAFT" | "PUBLISHED",
  ) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.reference) {
        toast.error(
          "Veuillez remplir les champs obligatoires (Nom, Référence).",
        );
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        ...(targetStatus && { status: targetStatus }),
      };

      let result;
      if (product?.id) {
        result = await updateProduct(product.id, submitData);
      } else {
        result = await createProduct(submitData);
      }

      if (result) {
        handleSuccess();
        if (!product?.id) {
          setFormData(initialFormData);
          setSelectedImageIndex(0);
          setCurrentStep(1);
          setFurthestStep(1);
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    const next = currentStep + 1;
    setCurrentStep(next);
    if (next > furthestStep) setFurthestStep(next);
  };

  const handleDataValidation = (step: number): boolean => {
    if (step === 1) {
      if (!formData.name) {
        toast.error("Le nom du produit est requis.");
        return false;
      }
    }
    return true;
  };

  const onNext = () => {
    if (handleDataValidation(currentStep)) {
      handleNextStep();
    }
  };

  const toggleStep = (step: number) => {
    if (step <= furthestStep) {
      setCurrentStep(currentStep === step ? 0 : step);
      if (step !== currentStep) setCurrentStep(step);
    }
  };

  return (
    <div className="max-mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {product?.id ? "Modifier le produit" : "Ajouter un produit"}
        </h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Annuler
          </Button>

          {}
          <ElectricButton
            onClick={() => handleSubmit(undefined, "DRAFT")}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white border-gray-600 shadow-[0_0_10px_rgba(100,116,139,0.3)] shadow-gray-500/50"
          >
            <Archive className="h-4 w-4 mr-2" />
            Sauvegarder (Brouillon)
          </ElectricButton>

          {}
          <ElectricButton
            onClick={() => handleSubmit(undefined, "PUBLISHED")}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {product?.id ? "Mettre à jour & Publier" : "Publier"}
          </ElectricButton>
        </div>
      </div>

      <div className="space-y-4">
        {}
        <ProductFormStep
          stepNumber={1}
          title="Détails & Tarification"
          description="Infos générales, Prix global et Promotions"
          isOpen={currentStep === 1}
          isCompleted={furthestStep > 1}
          onToggle={() => toggleStep(1)}
        >
          <ProductFormFields
            formData={formData}
            setFormData={setFormData}
            categories={categories}
          />
          <div className="flex justify-end mt-6">
            <Button onClick={onNext} className="gap-2">
              Suivant: Images <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ProductFormStep>

        {}
        <ProductFormStep
          stepNumber={2}
          title="Images du produit"
          description="Ajoutez des images et configurez les variantes visuelles"
          isOpen={currentStep === 2}
          isCompleted={furthestStep > 2}
          onToggle={() => toggleStep(2)}
        >
          <ProductImageUploader
            formData={formData}
            setFormData={setFormData}
            selectedImageIndex={selectedImageIndex}
            setSelectedImageIndex={setSelectedImageIndex}
            categories={categories}
          />
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Précédent
            </Button>
            <Button onClick={onNext} className="gap-2">
              Suivant: Variantes <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ProductFormStep>

        {}
        <ProductFormStep
          stepNumber={3}
          title="Générateur de Variantes"
          description="Générez et configurez les combinaisons (SKU, Stock, Prix Spécifique)"
          isOpen={currentStep === 3}
          isCompleted={furthestStep > 3}
          onToggle={() => toggleStep(3)}
        >
          <ProductVariants formData={formData} setFormData={setFormData} />
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Précédent
            </Button>
            <Button
              onClick={() => handleSubmit(undefined, "PUBLISHED")}
              variant="default"
            >
              Terminer et Publier <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </ProductFormStep>
      </div>
    </div>
  );
}

export { ProductFormFields } from "./ProductFormFields";
export { ProductPromotions } from "./ProductPromotions";
export { ProductVariants } from "./ProductVariants";
export { ProductImageUploader } from "./ProductImageUploader";
export { ProductOrganization } from "./ProductOrganization";
