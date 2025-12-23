"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import PhoneInput from "./PhoneInput";
import AddressMap from "./AddressMap";
import PaymentMethods from "./PaymentMethods";
import { useCartStore } from "@/lib/cart-store";

const formSchema = z.object({
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  address: z.string().min(5, "L'adresse est requise"),
  complement: z.string().optional(),
  paymentMethod: z.enum(["mvola", "orange_money", "airtel_money", "card"]),
  mvolaPhone: z.string().optional(),
  mvolaName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressCoords, setAddressCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      address: "",
      complement: "",
      paymentMethod: undefined,
      mvolaPhone: "",
      mvolaName: "",
    },
  });

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = form;

  const selectedPaymentMethod = watch("paymentMethod");
  const phoneValue = watch("phone");
  const addressValue = watch("address");
  const mvolaPhoneValue = watch("mvolaPhone");
  const mvolaNameValue = watch("mvolaName");

  const onAddressSelect = useCallback(
    (address: string, latLng: { lat: number; lng: number }) => {
      setValue("address", address, { shouldValidate: true });
      setAddressCoords(latLng);
    },
    [setValue],
  );

  const onSubmit = async (data: FormValues) => {
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    if (data.paymentMethod === "mvola") {
      if (!data.mvolaPhone) {
        form.setError("mvolaPhone", {
          type: "manual",
          message: "Numéro MVola requis",
        });
        return;
      }
      if (!data.mvolaName) {
        form.setError("mvolaName", {
          type: "manual",
          message: "Nom du titulaire requis",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            size: item.size,
          })),
          email: data.email,
          phone: data.phone,
          address: data.address,
          addressComplement: data.complement,
          addressCoords,
          paymentMethod: data.paymentMethod,
          mvolaPhone: data.mvolaPhone,
          mvolaName: data.mvolaName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Erreur lors de la commande");
        setIsSubmitting(false);
        return;
      }

      toast.success("Commande validée avec succès !");
      clearCart();
      router.push(`/checkout/success?ref=${result.order.reference}`);
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {}
      <section className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
            1
          </span>
          Identification
        </h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              {...form.register("email")}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <PhoneInput
            value={phoneValue}
            onChange={val => setValue("phone", val, { shouldValidate: true })}
            error={errors.phone?.message}
          />
        </div>
      </section>

      {}
      <section className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
            2
          </span>
          Livraison
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Adresse de livraison
            </label>
            <div className="relative">
              <input
                type="text"
                value={addressValue}
                readOnly
                placeholder="Sélectionnez votre position sur la carte"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 cursor-not-allowed"
              />
            </div>
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>

          <AddressMap onAddressSelect={onAddressSelect} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Complément d'adresse (Cité, étage, porte...)
            </label>
            <input
              {...form.register("complement")}
              placeholder="Ex: Porte A, 2ème étage..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </section>

      {}
      <section className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
            3
          </span>
          Paiement
        </h2>
        <PaymentMethods
          selected={selectedPaymentMethod || null}
          onChange={val =>
            setValue("paymentMethod", val, { shouldValidate: true })
          }
          mvolaPhone={mvolaPhoneValue || ""}
          onMvolaPhoneChange={val => setValue("mvolaPhone", val)}
          mvolaName={mvolaNameValue || ""}
          onMvolaNameChange={val => setValue("mvolaName", val)}
        />
        {errors.paymentMethod && (
          <p className="text-xs text-red-500 mt-2">
            {errors.paymentMethod.message}
          </p>
        )}
      </section>

      {}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Traitement...
            </>
          ) : (
            "Confirmer le paiement"
          )}
        </button>
        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-black hover:underline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la boutique
          </Link>
        </div>
      </div>
    </form>
  );
}
