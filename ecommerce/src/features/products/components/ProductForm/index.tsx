"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Save, ArrowRight, ArrowLeft, RefreshCw, Box } from "lucide-react";
import { Product, ProductImage } from "@/types/admin";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";

import ElectricButton from "@/components/ui/ElectricButton";
import { ProductFormFields } from "./ProductFormFields";
// New Promotion Step
import { ProductPromotions } from "./ProductPromotions";
import { ProductVariants } from "./ProductVariants";
import { ProductImageUploader } from "./ProductImageUploader";
import { useProducts } from "../../hooks/useProducts";
import { generateRandomReference } from "@/lib/stringUtils";
import { ProductOrganization } from "./ProductOrganization";
import { ProductFormStep } from "./ProductFormStep";

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
  // 1: Details, 2: Images, 3: Promotions
  const [currentStep, setCurrentStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);

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
        promotionRuleId: product.promotionRuleId || null,
      }));
    }
  }, [product]);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      if (
        !formData.name ||
        !formData.reference ||
        isNaN(formData.price) ||
        formData.price < 0
      ) {
        toast.error(
          "Veuillez remplir les champs obligatoires (Nom, Référence, Prix).",
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {product?.id ? "Modifier le produit" : "Ajouter un produit"}
        </h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <ElectricButton onClick={() => handleSubmit()} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading
              ? "Enregistrement..."
              : product?.id
                ? "Mettre à jour"
                : "Publier"}
          </ElectricButton>
        </div>
      </div>

      <div className="space-y-4">
        {/* Step 1: Details (Now includes Pricing & Stock) */}
        <ProductFormStep
          stepNumber={1}
          title="Détails du produit"
          description="Infos générales, Prix et Stock"
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

        {/* Step 2: Images */}
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
              Suivant: Promotions <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ProductFormStep>

        {/* Step 3: Promotions */}
        <ProductFormStep
          stepNumber={3}
          title="Marketing & Promotions"
          description="Appliquez des règles et configurez le type de produit"
          isOpen={currentStep === 3}
          isCompleted={furthestStep > 3}
          onToggle={() => toggleStep(3)}
        >
          <ProductPromotions formData={formData} setFormData={setFormData} />
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Précédent
            </Button>
            <Button onClick={() => setCurrentStep(0)} variant="outline">
              Terminer la configuration <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </ProductFormStep>
      </div>

      {/* Independent Variants Section */}
      <div className="mt-8 pt-8 border-t">
        <div className="bg-muted/30 rounded-xl border border-dashed border-primary/20 p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Variantes & Stocks
              </h3>
              <p className="text-sm text-muted-foreground">
                Générez des variantes spécifiques (SKU, Prix, Stock) basées sur
                vos sélections. C'est ici que vous ajustez le stock par
                taille/couleur.
              </p>
            </div>
          </div>

          <ProductVariants formData={formData} setFormData={setFormData} />

          <div className="flex justify-end pt-4 border-t border-dashed border-primary/20 mt-6">
            <ElectricButton
              onClick={() => handleSubmit()}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-6 text-lg"
            >
              <Save className="h-5 w-5 mr-3" />
              {product?.id ? "Mettre à jour le produit" : "Publier le produit"}
            </ElectricButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ProductFormFields } from "./ProductFormFields";
export { ProductPromotions } from "./ProductPromotions";
export { ProductVariants } from "./ProductVariants";
export { ProductImageUploader } from "./ProductImageUploader";
export { ProductOrganization } from "./ProductOrganization";
