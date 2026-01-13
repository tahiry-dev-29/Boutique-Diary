"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useProducts } from "@/features/products/hooks/useProducts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PromotionRule } from "../../types";
import { useCategories } from "@/features/categories/hooks/useCategories";

const formSchema = z.object({
  name: z.string().min(3, "Le nom est trop court").max(255),
  priority: z.coerce.number().int().default(0),
  conditions: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "JSON invalide"),
  actions: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "JSON invalide"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface PromotionRuleFormProps {
  initialData?: PromotionRule | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PromotionRuleForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: PromotionRuleFormProps) {
  const { categories } = useCategories();
  const { products } = useProducts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      priority: 0,
      conditions: "{}",
      actions: "{}",
      startDate: "",
      endDate: "",
      isActive: true,
    },
  });

  // Local state for UI builder
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<string>("");
  const [selectedProductId, setSelectedProductId] = React.useState<string>(""); // NEW
  const [openProductCombo, setOpenProductCombo] = React.useState(false); // NEW
  const [targetReference, setTargetReference] = React.useState<string>(""); // NEW
  const [isNew, setIsNew] = React.useState<boolean>(false);
  const [isBestSeller, setIsBestSeller] = React.useState<boolean>(false);
  const [discountPercent, setDiscountPercent] = React.useState<string>("");

  useEffect(() => {
    if (initialData) {
      const conditions = initialData.conditions as any;
      const actions = initialData.actions as any;

      form.reset({
        name: initialData.name,
        priority: initialData.priority,
        actions: JSON.stringify(actions, null, 2),
        props_conditions: JSON.stringify(conditions, null, 2),
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : "",
        isActive: initialData.isActive,
      } as any);

      // Pre-fill local state
      if (conditions.categoryId)
        setSelectedCategoryId(conditions.categoryId.toString());
      if (conditions.productId)
        setSelectedProductId(conditions.productId.toString());
      if (conditions.reference) setTargetReference(conditions.reference);
      if (conditions.isNew) setIsNew(true);
      if (conditions.isBestSeller) setIsBestSeller(true);

      if (actions.discountPercentage)
        setDiscountPercent(actions.discountPercentage.toString());
    }
  }, [initialData, form]);

  // Sync UI state to JSON strings
  useEffect(() => {
    const conditions: any = {};
    if (selectedCategoryId)
      conditions.categoryId = parseInt(selectedCategoryId);
    if (selectedProductId) conditions.productId = parseInt(selectedProductId); // NEW
    if (targetReference) conditions.reference = targetReference; // NEW
    if (isNew) conditions.isNew = true;
    if (isBestSeller) conditions.isBestSeller = true;

    const actions: any = {};
    if (discountPercent)
      actions.discountPercentage = parseFloat(discountPercent);

    form.setValue("conditions", JSON.stringify(conditions));
    form.setValue("actions", JSON.stringify(actions));
  }, [
    selectedCategoryId,
    selectedProductId,
    targetReference,
    isNew,
    isBestSeller,
    discountPercent,
    form,
  ]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedData = {
      ...values,
      conditions: JSON.parse(values.conditions),
      actions: JSON.parse(values.actions),
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la règle</FormLabel>
                <FormControl>
                  <Input placeholder="Promotion Été 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Plus élevé = appliqué en premier
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Actif</FormLabel>
                  <FormDescription>
                    Activer ou désactiver cette règle
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Date de début</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Date de fin</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 border rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">
            Ciblage & Conditions
          </h3>

          <div className="space-y-6">
            {}
            <div className="space-y-2">
              <FormLabel>Par Catégorie</FormLabel>
              <select
                className="w-full flex h-10 rounded-md border border-input dark:bg-gray-900/50 px-3 py-2 text-sm ring-offset-background"
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  if (e.target.value) {
                    setSelectedProductId(""); // Clear specific product if category selected
                    setTargetReference("");
                  }
                }}
              >
                <option value="">-- Ignorer Catégorie --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <Separator className="my-2" />

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="space-y-2 flex flex-col">
                  <FormLabel>Par Produit Spécifique</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !selectedProductId && "text-muted-foreground",
                        )}
                      >
                        {selectedProductId
                          ? products.find(
                              (p) => p.id?.toString() === selectedProductId,
                            )?.name
                          : "Choisir un produit..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher produit par nom ou ref..." />
                        <CommandList>
                          <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                setSelectedProductId("");
                                setOpenProductCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProductId === ""
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              -- Aucun --
                            </CommandItem>
                            {products.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={`${product.name} ${product.reference}`}
                                onSelect={() => {
                                  setSelectedProductId(
                                    product.id?.toString() || "",
                                  );
                                  if (product.id) setSelectedCategoryId(""); // Clear category
                                  setOpenProductCombo(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedProductId === product.id?.toString()
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{product.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {product.reference}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Recherche par Nom ou Référence. La règle s'appliquera
                    UNIQUEMENT à ce produit.
                  </FormDescription>
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Par Référence Exacte</FormLabel>
                <Input
                  placeholder="Ex: PANT-HE-001"
                  value={targetReference}
                  onChange={(e) => {
                    setTargetReference(e.target.value);
                    if (e.target.value) setSelectedCategoryId("");
                  }}
                />
                <FormDescription>
                  Ciblage manuel par code référence.
                </FormDescription>
              </div>
            </div>

            <Separator className="my-2" />

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-3 bg-white dark:bg-gray-900">
                <FormLabel className="text-sm">Seulement "Nouveauté"</FormLabel>
                <Switch checked={isNew} onCheckedChange={setIsNew} />
              </div>
              <div className="flex flex-row items-center justify-between rounded-lg border p-3 bg-white dark:bg-gray-900">
                <FormLabel className="text-sm">
                  Seulement "Best-seller"
                </FormLabel>
                <Switch
                  checked={isBestSeller}
                  onCheckedChange={setIsBestSeller}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 border rounded-xl p-4 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800">
          <h3 className="font-medium text-sm text-indigo-900 dark:text-indigo-100 mb-2">
            Action (Réduction)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FormLabel>Pourcentage de réduction (%)</FormLabel>
              <Input
                type="number"
                placeholder="Ex: 20"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                min="0"
                max="100"
              />
              <FormDescription>
                Le prix sera réduit de ce pourcentage (ex: 20% de remise).
              </FormDescription>
            </div>
          </div>
        </div>

        {}
        <input type="hidden" {...form.register("conditions")} />
        <input type="hidden" {...form.register("actions")} />

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-black dark:bg-white text-white dark:text-black"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Mettre à jour" : "Créer la règle"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
