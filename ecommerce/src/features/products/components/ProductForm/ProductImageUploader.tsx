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
import { X, Upload, Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { generateRandomReference } from "@/lib/stringUtils";

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
      const newImages: ProductImage[] = base64Strings.map((url) => ({
        url,
        color: null,
        sizes: [],
        reference: generateRandomReference(),
        stock: 0, // Default to 0? Or maybe assume some default
        price: null,
      }));
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
      }));
      toast.success(`${base64Strings.length} image(s) ajoutée(s)`);
    } catch {
      toast.error("Erreur lors de la lecture des fichiers");
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

      setFormData((prev) => ({
        ...prev,
        images: [
          ...(prev.images || []),
          { 
            url: data.path, 
            color: null, 
            sizes: [],
            reference: generateRandomReference(),
            stock: 0,
            price: null
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
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
    if (selectedImageIndex >= index && selectedImageIndex > 0) {
      setSelectedImageIndex((prev) => prev - 1);
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
    setFormData((prev) => ({ ...prev, images: newImages }));
    setSelectedImageIndex(0);
  };

  const handleUpdateImageAttribute = (
    index: number,
    field: "color" | "sizes" | "price" | "oldPrice" | "stock" | "reference" | "categoryId" | "isNew" | "isPromotion",
    value: string | string[] | number | boolean | null,
  ) => {
    const images = formData.images || [];
    const newImages = [...images];
    if (newImages[index] && typeof newImages[index] !== "string") {
      let newValue = value;
      if (value === "" || value === null || value === undefined) {
        if (field === "sizes") newValue = [];
        else if (field === "isNew" || field === "isPromotion") newValue = false;
        else newValue = null;
      }

      let autoReference = (newImages[index] as ProductImage).reference;
      
      // Only auto-generate if reference is empty (or on initial creation, which is handled above)
      // But user wants manual control or random, so we might want to expose a specific 'reference' field update
      if (field === "reference") {
         autoReference = newValue as string;
      }

      // If changing color, maybe we DON'T check/change reference automatically anymore if we want it random/fixed?
      // The user said "chaque images a son propres reference randoms". 
      // If they change color, we should probably Keep the random reference, unless they explicitly change the reference.
      
      newImages[index] = {
        ...(newImages[index] as ProductImage),
        [field]: newValue,
        reference: field === "reference" ? newValue as string : autoReference
      };
      setFormData({ ...formData, images: newImages });
    }
  };

  const images = formData.images || [];
  const currentImage = images[selectedImageIndex];
  const currentImageAsProductImage =
    currentImage && typeof currentImage !== "string"
      ? (currentImage as ProductImage)
      : null;

  return (
    <div className="space-y-4">
      <Label>Galerie d&apos;images (Max 6)</Label>

      {/* URL Input & Upload Button */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="URL de l'image..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAddUrl}
          disabled={!urlInput || images.length >= 6}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <label
          className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 border border-input bg-background hover:bg-accent hover:text-accent-foreground ${
            images.length >= 6 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Upload className="w-4 h-4" />
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

      {/* Main Image Preview */}
      <div className="relative w-full aspect-video bg-muted border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden flex items-center justify-center">
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
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="w-16 h-16 mb-2" />
            <span className="text-sm">Aucune image sélectionnée</span>
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-6 gap-2">
        {images.map((img, index) => (
          <div
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`relative aspect-square bg-muted border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
              index === selectedImageIndex
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
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
        ))}

        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 6 - images.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square bg-muted border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center text-muted-foreground"
          >
            <span className="text-xs">{images.length + i + 1}</span>
          </div>
        ))}
      </div>

      {/* Image Specific Settings */}
      {currentImageAsProductImage && (
        <div className="bg-muted/50 p-4 rounded-lg border">
          <h4 className="text-sm font-medium mb-3">
            Paramètres de l&apos;image {selectedImageIndex + 1}
          </h4>

          {/* Reference */}
          <div className="mb-3 p-3 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Référence Unique (SKU)</span>
              <Badge variant="outline" className="font-mono">
                {currentImageAsProductImage.reference}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Input 
                value={currentImageAsProductImage.reference || ""}
                onChange={(e) => handleUpdateImageAttribute(selectedImageIndex, "reference", e.target.value)}
                placeholder="#REF123"
                className="font-mono text-sm h-9"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 shrink-0"
                onClick={() => handleUpdateImageAttribute(selectedImageIndex, "reference", generateRandomReference())}
                title="Générer une nouvelle référence aléatoire"
              >
                <div className="h-4 w-4 rotate-45 border-2 border-current border-t-transparent border-l-transparent rounded-full" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Chaque variante d&apos;image possède sa propre référence unique (générée aléatoirement ou personnalisable).
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Organization & Status - Per Image */}
             <div className="space-y-2">
              <Label className="text-xs">Catégorie</Label>
               <Select
                value={currentImageAsProductImage.categoryId?.toString() || "uncategorized"}
                onValueChange={(value) =>
                  handleUpdateImageAttribute(selectedImageIndex, "categoryId", value === "uncategorized" ? null : parseInt(value))
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Non classé" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Non classé</SelectItem>
                  {categories?.map((category) => (
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

            <div className="space-y-2">
              <Label className="text-xs">Statut Nouveauté</Label>
               <Select
                value={currentImageAsProductImage.isNew ? "new" : "standard"}
                onValueChange={(value) => handleUpdateImageAttribute(selectedImageIndex, "isNew", value === "new")}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="new">Nouveauté</SelectItem>
                </SelectContent>
              </Select>
            </div>

             <div className="space-y-2">
              <Label className="text-xs">Type Promotion</Label>
               <Select
                  value={currentImageAsProductImage.isPromotion ? "promo" : "standard"}
                  onValueChange={(value) => handleUpdateImageAttribute(selectedImageIndex, "isPromotion", value === "promo")}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="promo">En Promotion</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            {}
            <div className="space-y-2">
              <Label className="text-xs">Couleur associée</Label>
              <Select
                value={currentImageAsProductImage.color || "none"}
                onValueChange={(value) =>
                  handleUpdateImageAttribute(selectedImageIndex, "color", value === "none" ? null : value)
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {formData.colors?.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label className="text-xs">Prix spécifique (Ar)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Prix par défaut"
                value={currentImageAsProductImage.price || ""}
                onChange={(e) =>
                  handleUpdateImageAttribute(
                    selectedImageIndex,
                    "price",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                className="h-8 text-sm"
              />
            </div>

            {}
            <div className="space-y-2">
              <Label className="text-xs">Ancien prix (Ar)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 15000"
                value={currentImageAsProductImage.oldPrice || ""}
                onChange={(e) =>
                  handleUpdateImageAttribute(
                    selectedImageIndex,
                    "oldPrice",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                className="h-8 text-sm"
              />
            </div>

            {}
            <div className="space-y-2">
              <Label className="text-xs">Stock</Label>
              <Input
                type="number"
                min="0"
                placeholder="Stock spécifique"
                value={currentImageAsProductImage.stock || ""}
                onChange={(e) =>
                  handleUpdateImageAttribute(
                    selectedImageIndex,
                    "stock",
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className="h-8 text-sm"
              />
            </div>

            {}
            <div className="col-span-2 space-y-2">
              <Label className="text-xs">Tailles associées</Label>
              <div className="flex flex-wrap gap-2">
                {formData.sizes?.map((size) => (
                  <label
                    key={size}
                    className="flex items-center gap-1.5 text-xs cursor-pointer bg-background px-2 py-1 rounded border hover:border-primary/50"
                  >
                    <Checkbox
                      checked={
                        currentImageAsProductImage.sizes?.includes(size) ||
                        false
                      }
                      onCheckedChange={(checked) => {
                        const currentSizes =
                          currentImageAsProductImage.sizes || [];
                        const newSizes = checked
                          ? [...currentSizes, size]
                          : currentSizes.filter((s) => s !== size);
                        handleUpdateImageAttribute(
                          selectedImageIndex,
                          "sizes",
                          newSizes,
                        );
                      }}
                      className="h-3 w-3"
                    />
                    {size}
                  </label>
                ))}
              </div>
              {(!formData.sizes || formData.sizes.length === 0) && (
                <p className="text-xs text-muted-foreground italic">
                  Aucune taille définie pour le produit
                </p>
              )}
            </div>
          </div>

          {selectedImageIndex !== 0 && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => handleSetMainImage(selectedImageIndex)}
              className="mt-3 p-0 h-auto"
            >
              Définir comme image principale
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
