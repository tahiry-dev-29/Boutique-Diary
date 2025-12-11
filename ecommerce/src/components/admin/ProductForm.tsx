"use client";

import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Plus,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Loader2,
  Trash2,
} from "lucide-react";
import { Product, ProductImage } from "@/types/admin";
import { Category } from "@/types/category";
import { AVAILABLE_COLORS, AVAILABLE_SIZES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import ElectricButton from "@/components/ui/ElectricButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Strict types for form state
interface FormImage extends Partial<ProductImage> {
  url: string;
  color: string | null;
  sizes: string[];
  price?: number | null;
  oldPrice?: number | null;
  stock?: number | null;
  reference?: string;
  // Temporary ID for UI handling if needed
  tempId?: string;
}

interface FormProduct extends Omit<Product, "images"> {
  images: FormImage[];
}

export default function ProductForm({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState<FormProduct>({
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
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus management for images
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
          product.images?.map((img: any): FormImage => {
            if (typeof img === "string") {
              return { url: img, color: null, sizes: [] };
            }
            return {
              url: img.url,
              color: img.color || null,
              sizes: img.sizes || [],
              price: img.price,
              oldPrice: img.oldPrice,
              stock: img.stock,
              reference: img.reference,
              id: img.id,
            };
          }) || [],
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
        id: product.id,
      });
    }
  }, [product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 6 - formData.images.length;
    if (remainingSlots === 0) {
      toast.error("Maximum 6 images authorized");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const validFiles: File[] = [];

    for (const file of filesToProcess) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const base64Promises = validFiles.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(`Error reading ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    try {
      const base64Strings = await Promise.all(base64Promises);
      const newImages: FormImage[] = base64Strings.map((url) => ({
        url,
        color: null,
        sizes: [],
      }));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      toast.success(`${base64Strings.length} image(s) added`);
    } catch {
      toast.error("Error processing files");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = async () => {
    if (!urlInput) return;
    if (formData.images.length >= 6) {
      toast.error("Maximum 6 images authorized");
      return;
    }

    const loadingToast = toast.loading("Downloading image...");

    try {
      const response = await fetch("/api/upload-url-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Download failed");
        toast.dismiss(loadingToast);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, { url: data.path, color: null, sizes: [] }],
      }));

      toast.success("Image added successfully");
      setUrlInput("");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    if (selectedImageIndex >= index && selectedImageIndex > 0) {
      setSelectedImageIndex((prev) => prev - 1);
    } else if (selectedImageIndex === index) {
        setSelectedImageIndex(0);
    }
  };

  const handleUpdateImageAttribute = (
    index: number,
    field: keyof FormImage,
    value: any,
  ) => {
    const newImages = [...formData.images];
    if (newImages[index]) {
      // Logic for auto-generating reference based on color
      let autoReference = newImages[index].reference;
        if (field === "color") {
             if(value && typeof value === 'string') {
                 const productRef = formData.reference || "";
                 const colorAbbrev = value.toLowerCase().slice(0, 3);
                 autoReference = `${productRef}-${colorAbbrev}`;
             } else {
                  const productRef = formData.reference || "";
                  autoReference = `${productRef}-img${index + 1}`;
             }
        }

      newImages[index] = {
        ...newImages[index],
        [field]: value,
         ...(field === "color" && { reference: autoReference }),
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
        formData.price < 0
      ) {
        toast.error("Please fill all required fields correctly.");
        setLoading(false);
        return;
      }

      const url = product?.id ? `/api/products/${product.id}` : "/api/products";
      const method = product?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          product?.id
            ? "Product updated successfully"
            : "Product created successfully",
        );
        onSuccess();
      } else {
        const data = await response.json();
        toast.error(data.error || "An error occurred");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">
            {product?.id ? "Edit Product" : "Add Products"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onCancel} type="button">
            Discard
          </Button>
          <Button variant="outline" type="button" disabled>
            Save Draft
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-black text-white hover:bg-gray-800"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Details */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-gray-50/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Reference)</Label>
                    <Input
                      id="sku"
                      placeholder="SKU"
                      value={formData.reference}
                      onChange={(e) => {
                           const newRef = e.target.value;
                            setFormData((prev) => ({
                                ...prev,
                                reference: newRef,
                                // Update image references
                                images: prev.images.map((img, idx) => {
                                const suffix = img.color
                                    ? img.color.toLowerCase().slice(0, 3)
                                    : `img${idx + 1}`;
                                return {
                                    ...img,
                                    reference: `${newRef}-${suffix}`,
                                };
                                }),
                            }));
                      }}

                      className="bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      placeholder="Brand Name"
                      value={formData.brand || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      className="bg-gray-50/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Set a description to the product for better visibility."
                    className="min-h-[120px] bg-gray-50/50 resize-y"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Product Images
                </CardTitle>
                <div className="flex gap-2">
                    <Input
                        placeholder="Add media from URL"
                        className="h-8 text-sm w-48"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                    />
                     <Button variant="ghost" size="sm" onClick={handleAddUrl} disabled={!urlInput} className="text-indigo-600">
                        Add
                     </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50/30 text-center hover:bg-gray-50/80 transition-colors">
                    {formData.images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {formData.images.map((img, index) => (
                                <div key={index} className="group relative aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                    <img src={img.url} alt={`Product ${index}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="p-1.5 bg-white text-red-500 rounded-full hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedImageIndex(index)}
                                          className="p-1.5 bg-white text-blue-500 rounded-full hover:bg-blue-50"
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                        </button>

                                    </div>
                                    {index === 0 && <div className="absolute top-0 left-0 w-full bg-indigo-600 text-white text-[10px] py-0.5 font-medium">MAIN</div>}
                                </div>
                            ))}
                             {formData.images.length < 6 && (
                                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                                    <Plus className="w-6 h-6 text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500 font-medium">Add</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            )}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center py-6">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                Drop your Images here
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                                PNG or JPG (max. 5MB)
                            </p>
                            <label className="cursor-pointer">
                                <Button type="button" variant="outline" className="pointer-events-none">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Select Images
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Specific Image Settings */}
                {formData.images[selectedImageIndex] && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-indigo-500" />
                            Settings for Image {selectedImageIndex + 1}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-lg border border-gray-200">
                             <div>
                                <Label className="text-xs mb-1.5 block">Color Variant</Label>
                                <Select
                                    value={formData.images[selectedImageIndex].color || ""}
                                    onValueChange={(val) => handleUpdateImageAttribute(selectedImageIndex, "color", val === "none" ? null : val)}
                                >
                                    <SelectTrigger className="h-9 bg-white">
                                        <SelectValue placeholder="Select color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {formData.colors?.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                             </div>
                             <div>
                                <Label className="text-xs mb-1.5 block">Specific Price</Label>
                                <Input
                                    type="number"
                                    placeholder="Default Price"
                                    className="h-9 bg-white"
                                    value={formData.images[selectedImageIndex].price || ""}
                                    onChange={(e) => handleUpdateImageAttribute(selectedImageIndex, "price", e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                             </div>
                              <div>
                                <Label className="text-xs mb-1.5 block">Specific Stock</Label>
                                <Input
                                    type="number"
                                    placeholder="Default Stock"
                                    className="h-9 bg-white"
                                    value={formData.images[selectedImageIndex].stock || ""}
                                    onChange={(e) => handleUpdateImageAttribute(selectedImageIndex, "stock", e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                             </div>
                              <div>
                                <Label className="text-xs mb-1.5 block">Sizes</Label>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {formData.sizes?.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => {
                                                const current = formData.images[selectedImageIndex].sizes || [];
                                                const newSizes = current.includes(size) ? current.filter(s => s !== size) : [...current, size];
                                                handleUpdateImageAttribute(selectedImageIndex, "sizes", newSizes);
                                            }}
                                             className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                                formData.images[selectedImageIndex].sizes?.includes(size)
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                             }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                    {(!formData.sizes || formData.sizes.length === 0) && <span className="text-xs text-gray-400 italic">No global sizes added</span>}
                                </div>
                             </div>
                        </div>
                    </div>
                )}


              </CardContent>
            </Card>

            {/* Variants */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                         <div className="md:col-span-1">
                             <Label className="text-sm font-medium">Global Colors</Label>
                             <p className="text-xs text-gray-500 mt-1">Select available colors for this product.</p>
                         </div>
                         <div className="md:col-span-2 space-y-3">
                             <Select
                                onValueChange={(val) => {
                                    if(val && !formData.colors?.includes(val)) {
                                        setFormData({...formData, colors: [...(formData.colors || []), val]})
                                    }
                                }}
                             >
                                <SelectTrigger> <SelectValue placeholder="Add Color" /> </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                             </Select>
                             <div className="flex flex-wrap gap-2">
                                {formData.colors?.map(color => (
                                    <Badge key={color} variant="secondary" className="pl-2 pr-1 h-7">
                                        {color}
                                        <button type="button" onClick={() => setFormData({...formData, colors: formData.colors?.filter(c => c !== color)})} className="ml-1 p-0.5 hover:bg-gray-200 rounded-full"><X className="w-3 h-3" /></button>
                                    </Badge>
                                ))}
                             </div>
                         </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                     {/* Sizes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                         <div className="md:col-span-1">
                             <Label className="text-sm font-medium">Global Sizes</Label>
                             <p className="text-xs text-gray-500 mt-1">Select available sizes.</p>
                         </div>
                         <div className="md:col-span-2 space-y-3">
                             <Select
                                onValueChange={(val) => {
                                    if(val && !formData.sizes?.includes(val)) {
                                        setFormData({...formData, sizes: [...(formData.sizes || []), val]})
                                    }
                                }}
                             >
                                <SelectTrigger> <SelectValue placeholder="Add Size" /> </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                             </Select>
                             <div className="flex flex-wrap gap-2">
                                {formData.sizes?.map(size => (
                                    <Badge key={size} variant="secondary" className="pl-2 pr-1 h-7">
                                        {size}
                                        <button type="button" onClick={() => setFormData({...formData, sizes: formData.sizes?.filter(s => s !== size)})} className="ml-1 p-0.5 hover:bg-gray-200 rounded-full"><X className="w-3 h-3" /></button>
                                    </Badge>
                                ))}
                             </div>
                         </div>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-8">
            {/* Pricing */}
             <Card className="shadow-sm border-gray-200">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Base Price</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price || ""}
                            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="oldPrice">Discounted Price (Option)</Label>
                        <Input
                            id="oldPrice"
                            type="number"
                             min="0"
                            step="0.01"
                            value={formData.oldPrice || ""}
                            onChange={(e) => setFormData({...formData, oldPrice: e.target.value ? parseFloat(e.target.value) : null})}
                        />
                    </div>
                    {/* Mock checkbox for UI fidelity */}
                    <div className="flex items-center space-x-2 pt-2">
                         <Switch id="tax" disabled />
                         <Label htmlFor="tax" className="text-sm font-normal text-gray-600">Charge tax on this product</Label>
                    </div>

                    <div className="border-t border-gray-100 my-4 pt-4 flex items-center justify-between">
                         <Label htmlFor="stock_toggle" className="font-medium">In stock</Label>
                         <Switch
                            id="stock_toggle"
                            checked={formData.stock > 0}
                            onCheckedChange={(checked) => setFormData({...formData, stock: checked ? 10 : 0})}
                         />
                    </div>
                    {formData.stock > 0 && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                             <Label htmlFor="stock">Total Stock Quantity</Label>
                             <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                             />
                        </div>
                    )}

                </CardContent>
             </Card>

             {/* Status */}
             <Card className="shadow-sm border-gray-200">
                 <CardHeader>
                     <CardTitle className="text-base font-semibold">Status</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <Select defaultValue="draft">
                         <SelectTrigger>
                             <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-orange-400" />
                                 <SelectValue placeholder="Status" />
                             </div>
                         </SelectTrigger>
                         <SelectContent>
                             <SelectItem value="draft">Draft</SelectItem>
                             <SelectItem value="active">Active</SelectItem>
                         </SelectContent>
                     </Select>
                     <p className="text-xs text-gray-500">Set the product status.</p>

                     <div className="pt-4 space-y-3">
                         <div className="flex items-center justify-between">
                            <Label htmlFor="new" className="text-sm font-normal">Is New?</Label>
                            <Switch id="new" checked={formData.isNew || false} onCheckedChange={(c) => setFormData({...formData, isNew: c})} />
                         </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="promo" className="text-sm font-normal">Promotion?</Label>
                            <Switch id="promo" checked={formData.isPromotion || false} onCheckedChange={(c) => setFormData({...formData, isPromotion: c})} />
                         </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="best" className="text-sm font-normal">Best Seller?</Label>
                            <Switch id="best" checked={formData.isBestSeller || false} onCheckedChange={(c) => setFormData({...formData, isBestSeller: c})} />
                         </div>
                     </div>
                 </CardContent>
             </Card>

             {/* Categories */}
              <Card className="shadow-sm border-gray-200">
                 <CardHeader>
                     <CardTitle className="text-base font-semibold">Categories</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Product Category</Label>
                        <Select
                            value={formData.categoryId?.toString() || ""}
                            onValueChange={(val) => setFormData({...formData, categoryId: parseInt(val)})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(c => (
                                    <SelectItem key={c.id} value={c.id?.toString() || ""}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                 </CardContent>
              </Card>

          </div>
        </div>
      </div>
    </form>
  );
}
