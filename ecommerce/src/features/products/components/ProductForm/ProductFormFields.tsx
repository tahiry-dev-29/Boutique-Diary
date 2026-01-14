import { Product } from "@/types/admin";
import { Category } from "@/types/category";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tag, Wand2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductFormFieldsProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  categories?: Category[];
}

export function ProductFormFields({
  formData,
  setFormData,
}: ProductFormFieldsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (field: keyof Product, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      toast.error("Veuillez d'abord saisir un nom de produit");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/admin/products/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      handleChange("description", data.description);
      toast.success("Description générée avec succès !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la génération");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="group relative overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/50 p-6 backdrop-blur-xl transition-all hover:shadow-2xl hover:shadow-primary/5">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <h3 className="relative mb-6 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <Tag className="h-4 w-4" />
          </div>
          Informations Générales
        </h3>

        <div className="relative space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Nom du produit *
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Robe d'été fleurie"
              className="h-11 border-black/5 bg-black/5 dark:border-white/10 dark:bg-white/5 focus:border-primary focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="brand"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Marque
            </Label>
            <Input
              id="brand"
              type="text"
              value={formData.brand || ""}
              onChange={(e) => handleChange("brand", e.target.value)}
              placeholder="Ex: Zara"
              className="h-11 border-black/5 bg-black/5 dark:border-white/10 dark:bg-white/5 focus:border-primary focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2 h-full">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="description"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Description
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={isGenerating || !formData.name}
                className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
              >
                {isGenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Wand2 className="w-3 h-3 mr-1" />
                )}
                Générer avec IA
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={5}
              placeholder="Description détaillée..."
              className="resize-none border-black/5 bg-black/5 dark:border-white/10 dark:bg-white/5 focus:border-primary focus:ring-primary/20 min-h-[100px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
