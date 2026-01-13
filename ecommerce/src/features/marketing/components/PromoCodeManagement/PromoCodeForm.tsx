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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Wand2 } from "lucide-react";
import { DiscountType, PromoCode } from "../../types";

const formSchema = z.object({
  code: z
    .string()
    .min(3, "Le code doit contenir au moins 3 caractères")
    .max(50, "Le code est trop long")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Lettres majuscules, chiffres, tirets et underscores uniquement",
    ),
  type: z.nativeEnum(DiscountType),
  value: z.coerce
    .number()
    .min(0, "La valeur doit être positive")
    .refine((val) => val > 0, "La valeur doit être supérieure à 0"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  usageLimit: z.coerce.number().min(0).optional().nullable(),
  minOrderAmount: z.coerce.number().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
});

interface PromoCodeFormProps {
  initialData?: PromoCode | null;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PromoCodeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: PromoCodeFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      code: "",
      type: DiscountType.PERCENTAGE,
      value: 0,
      startDate: "",
      endDate: "",
      usageLimit: null,
      minOrderAmount: null,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code,
        type: initialData.type,
        value: initialData.value,
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : "",
        usageLimit: initialData.usageLimit,
        minOrderAmount: initialData.minOrderAmount,
        isActive: initialData.isActive,
      });
    } else {
      form.reset({
        code: "",
        type: DiscountType.PERCENTAGE,
        value: 0,
        startDate: "",
        endDate: "",
        usageLimit: null,
        minOrderAmount: null,
        isActive: true,
      });
    }
  }, [initialData, form]);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("code", result);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code Promo</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="SUMMER2025"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateCode}
                    title="Générer un code aléatoire"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>
                  Code unique à saisir par le client.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Actif</FormLabel>
                  <FormDescription>
                    Activer ou désactiver ce code promo.
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

          {}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de réduction</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={DiscountType.PERCENTAGE}>
                      Pourcentage (%)
                    </SelectItem>
                    <SelectItem value={DiscountType.FIXED_AMOUNT}>
                      Montant Fixe (Ar)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {}
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valeur</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="20"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  {form.watch("type") === DiscountType.PERCENTAGE
                    ? "Pourcentage de réduction (ex: 20 pour 20%)"
                    : "Montant de la réduction en Ariary"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <FormLabel>Date de fin</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Limits */}
          <FormField
            control={form.control}
            name="usageLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite d'utilisation (Optionnel)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Illimité"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? null : Number(val));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Nombre maximum de fois que ce code peut être utilisé au total.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minOrderAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant minimum (Optionnel)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? null : Number(val));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Montant minimum du panier pour appliquer le code.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            {initialData ? "Mettre à jour" : "Créer le code promo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
