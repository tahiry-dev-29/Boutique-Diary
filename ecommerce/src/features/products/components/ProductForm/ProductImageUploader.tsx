"use client";

import { useState } from "react";
import { ProductImage, Product } from "@/types/admin";
import { Category } from "@/types/category";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  MoreVertical,
  Star,
  Check,
  Package,
  Wand2,
  Plus,
  Upload,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { generateRandomReference } from "@/lib/stringUtils";
import { usePromotionRules } from "@/features/marketing/hooks/use-promotion-rules";
import { AVAILABLE_COLORS, AVAILABLE_SIZES, COLOR_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProductImageUploaderProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  selectedImageIndex: number;
  setSelectedImageIndex: React.Dispatch<React.SetStateAction<number>>;
  categories: Category[];
}

export function ProductImageUploader({
  formData,
  setFormData,
  selectedImageIndex,
  setSelectedImageIndex,
  categories,
}: ProductImageUploaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const { rules } = usePromotionRules();
  const activeRules = rules.filter(r => r.isActive);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const images = formData.images || [];
    const remainingSlots = 6 - images.length;
    if (remainingSlots === 0) {
      toast.error("Maximum 6 images autorisées");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const validFiles: File[] = [];

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

    const uploadPromises = validFiles.map(async file => {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      
      uploadFormData.append("productName", formData.name || "product");
      uploadFormData.append("reference", formData.reference || "REF");

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
      } catch (err) {
        console.error("Upload error for", file.name, err);
        toast.error(`Echec upload ${file.name}`);
        return null;
      }
    });

    try {
      const loadingToast = toast.loading("Téléchargement des images...");
      const urls = (await Promise.all(uploadPromises)).filter(
        url => url !== null,
      );

      const newImages: ProductImage[] = urls.map(url => ({
        url,
        color: null,
        sizes: [],
        reference: generateRandomReference(),
        stock: 0,
        price: null,
      }));

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
      }));

      toast.dismiss(loadingToast);
      toast.success(`${urls.length} image(s) ajoutée(s)`);
    } catch {
      toast.error("Erreur lors du traitement des images");
    }

    e.target.value = "";
  };

  const handleAddUrl = async () => {
    if (!urlInput) return;

    const images = formData.images || [];
    if (images.length >= 6) {
      toast.error("Maximum 6 images autorisées");
      return;
    }

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

      setFormData(prev => ({
        ...prev,
        images: [
          ...(prev.images || []),
          {
            url: data.path,
            color: null,
            sizes: [],
            reference: generateRandomReference(),
            stock: 0,
            price: null,
          },
        ],
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
    const images = formData.images || [];
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
    if (selectedImageIndex >= index && selectedImageIndex > 0) {
      setSelectedImageIndex(prev => prev - 1);
    } else if (selectedImageIndex === index && images.length === 1) {
      setSelectedImageIndex(0);
    } else if (selectedImageIndex === index && index === images.length - 1) {
      setSelectedImageIndex(images.length - 2);
    }
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    const images = formData.images || [];
    const newImages = [...images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setFormData(prev => ({ ...prev, images: newImages }));
    setSelectedImageIndex(0);
  };

  const handleUpdateImageAttribute = (
    index: number,
    field:
      | "color"
      | "sizes"
      | "reference"
      | "categoryId"
      | "isNew"
      | "isBestSeller"
      | "isPromotion"
      | "promotionRuleId",
    value: string | string[] | number | boolean | null,
  ) => {
    setFormData(prev => {
      const images = prev.images || [];
      const newImages = [...images];

      if (newImages[index] && typeof newImages[index] !== "string") {
        let newValue = value;
        if (value === "" || value === null || value === undefined) {
          if (field === "sizes") newValue = [];
          else if (field === "isNew" || field === "isPromotion")
            newValue = false;
          else newValue = null;
        }

        const currentImg = newImages[index] as ProductImage;
        
        let autoReference = currentImg.reference || generateRandomReference();

        
        if (field === "reference") {
          autoReference = newValue as string;
        }

        newImages[index] = {
          ...currentImg,
          [field]: newValue,
          reference:
            field === "reference" ? (newValue as string) : autoReference,
        };
      }
      return { ...prev, images: newImages };
    });
  };

  const images = formData.images || [];
  const currentImage = images[selectedImageIndex];
  const currentImageAsProductImage =
    currentImage && typeof currentImage !== "string"
      ? (currentImage as ProductImage)
      : null;

  return (
    <div className="space-y-6">
      <div className="group relative overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/50 p-6 backdrop-blur-xl transition-all hover:shadow-2xl hover:shadow-primary/5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <h3 className="relative mb-6 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <ImageIcon className="h-4 w-4" />
          </div>
          Galerie & Médias
        </h3>

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Images du produit (Max 6)
            </Label>
            <span className="text-xs text-muted-foreground">
              {images.length} / 6
            </span>
          </div>

          {}
          <div className="flex gap-3">
            <Input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="URL de l'image (https://...)"
              className="h-10 flex-1 border-black/5 bg-black/5 dark:border-white/10 dark:bg-white/5 focus:border-primary focus:ring-primary/20"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddUrl}
              disabled={!urlInput || images.length >= 6}
              className="h-10 w-10 border-black/5 bg-black/5 hover:bg-primary/10 hover:text-primary dark:border-white/10 dark:bg-white/5"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <label
              className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-dashed border-primary/30 bg-primary/5 text-primary transition-colors hover:bg-primary/10 ${
                images.length >= 6 ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={images.length >= 6}
                className="hidden"
              />
            </label>
          </div>

          {}
          <div className="relative w-full h-[350px] bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
            {currentImage ? (
              <>
                <img
                  src={
                    typeof currentImage === "string"
                      ? currentImage
                      : currentImage.url
                  }
                  alt="Image principale"
                  className="w-full h-full object-contain"
                />
                <Badge variant="secondary" className="absolute top-2 left-2">
                  {selectedImageIndex === 0
                    ? "Image Principale"
                    : `Image ${selectedImageIndex + 1}`}
                </Badge>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => handleRemoveImage(selectedImageIndex)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <ImageIcon className="w-16 h-16 mb-2" />
                <span className="text-sm">Aucune image sélectionnée</span>
              </div>
            )}
          </div>

          {}
          <div className="grid grid-cols-6 gap-2">
            {images.map((img, index) => {
              const uniqueKey =
                typeof img === "string" ? img : img.reference || `img-${index}`;
              return (
                <div
                  key={uniqueKey}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square bg-gray-50 dark:bg-gray-900/50 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    index === selectedImageIndex
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  <img
                    src={typeof img === "string" ? img : img.url}
                    alt={`Vue ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[8px] text-center py-0.5">
                      MAIN
                    </div>
                  )}
                </div>
              );
            })}

            {}
            {Array.from({ length: Math.max(0, 6 - images.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500"
                >
                  <span className="text-xs">{images.length + i + 1}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {}
      {currentImageAsProductImage && (
        <div className="group relative overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/50 p-6 backdrop-blur-xl transition-all hover:shadow-2xl hover:shadow-primary/5">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <h4 className="relative mb-6 flex items-center gap-2 text-sm font-semibold tracking-tight">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
              <div className="h-1.5 w-1.5 rounded-full bg-current" />
            </div>
            Paramètres de l&apos;image {selectedImageIndex + 1}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {}
            <div className="space-y-4">
              {}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Référence Image (SKU Base)
                  </Label>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {currentImageAsProductImage.reference}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={currentImageAsProductImage.reference || ""}
                    onChange={e =>
                      handleUpdateImageAttribute(
                        selectedImageIndex,
                        "reference",
                        e.target.value,
                      )
                    }
                    placeholder="#REF123"
                    className="font-mono text-sm h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() =>
                      handleUpdateImageAttribute(
                        selectedImageIndex,
                        "reference",
                        generateRandomReference(),
                      )
                    }
                    title="Générer une nouvelle référence aléatoire"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Catégorie
                </Label>
                <Select
                  value={
                    currentImageAsProductImage.categoryId?.toString() ||
                    "uncategorized"
                  }
                  onValueChange={value =>
                    handleUpdateImageAttribute(
                      selectedImageIndex,
                      "categoryId",
                      value === "uncategorized" ? null : parseInt(value),
                    )
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Non classé" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uncategorized">Non classé</SelectItem>
                    {categories?.map(category => (
                      <SelectItem
                        key={category.id}
                        value={category.id?.toString() || ""}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Statuses */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Statuts & Visibilité
                </Label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-black/5 bg-black/5 px-2 py-1.5 transition-colors hover:bg-primary/5 hover:border-primary/20 dark:border-white/5 dark:bg-white/5 text-xs">
                    <Checkbox
                      checked={currentImageAsProductImage.isNew || false}
                      onCheckedChange={checked =>
                        handleUpdateImageAttribute(
                          selectedImageIndex,
                          "isNew",
                          !!checked,
                        )
                      }
                      className="h-3.5 w-3.5"
                    />
                    <span>Nouveauté</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-black/5 bg-black/5 px-2 py-1.5 transition-colors hover:bg-primary/5 hover:border-primary/20 dark:border-white/5 dark:bg-white/5 text-xs">
                    <Checkbox
                      checked={
                        (currentImageAsProductImage as any).isBestSeller ||
                        false
                      }
                      onCheckedChange={checked =>
                        handleUpdateImageAttribute(
                          selectedImageIndex,
                          "isBestSeller",
                          !!checked,
                        )
                      }
                      className="h-3.5 w-3.5"
                    />
                    <span>Best Seller</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-black/5 bg-black/5 px-2 py-1.5 transition-colors hover:bg-primary/5 hover:border-primary/20 dark:border-white/5 dark:bg-white/5 text-xs opacity-60">
                    <Checkbox
                      checked={currentImageAsProductImage.isPromotion || false}
                      disabled
                      className="h-3.5 w-3.5"
                    />
                    <span>Promo</span>
                  </label>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-4">
              {}
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Règle de Promotion
                </Label>
                <Select
                  value={
                    currentImageAsProductImage.promotionRuleId?.toString() ||
                    "none"
                  }
                  onValueChange={value =>
                    handleUpdateImageAttribute(
                      selectedImageIndex,
                      "promotionRuleId",
                      value === "none" ? null : parseInt(value),
                    )
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {activeRules.map(rule => (
                      <SelectItem key={rule.id} value={rule.id.toString()}>
                        {rule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {}
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Colori Principal
                </Label>
                <div className="flex flex-wrap gap-2">
                  {}
                  <Select
                    value={currentImageAsProductImage.color || "none"}
                    onValueChange={value =>
                      handleUpdateImageAttribute(
                        selectedImageIndex,
                        "color",
                        value === "none" ? null : value,
                      )
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Choisir une couleur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {AVAILABLE_COLORS.map(color => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full border shadow-sm"
                              style={{ background: COLOR_MAP[color] || color }}
                            />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tailles Disponibles
                </Label>
                <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-black/5 bg-black/5 dark:border-white/5 dark:bg-white/5">
                  {AVAILABLE_SIZES.map(size => (
                    <label
                      key={size}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-md border text-xs cursor-pointer transition-all",
                        currentImageAsProductImage.sizes?.includes(size)
                          ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                          : "bg-white dark:bg-black border-transparent hover:border-gray-300 dark:hover:border-gray-700",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={
                          currentImageAsProductImage.sizes?.includes(size) ||
                          false
                        }
                        onChange={e => {
                          const currentSizes =
                            currentImageAsProductImage.sizes || [];
                          const newSizes = e.target.checked
                            ? [...currentSizes, size]
                            : currentSizes.filter(s => s !== size);
                          handleUpdateImageAttribute(
                            selectedImageIndex,
                            "sizes",
                            newSizes,
                          );
                        }}
                      />
                      {size}
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Sélectionnez les tailles disponibles pour cette variante
                  visuelle.
                </p>
              </div>
            </div>
          </div>

          {selectedImageIndex !== 0 && (
            <div className="flex justify-end mt-4 pt-4 border-t border-black/5 dark:border-white/5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSetMainImage(selectedImageIndex)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <Star className="w-3 h-3 mr-1.5" />
                Définir comme image principale
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
