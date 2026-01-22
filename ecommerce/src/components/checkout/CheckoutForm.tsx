"use client";

import { useState, useCallback, useEffect } from "react";
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
import { cn } from "@/lib/utils";

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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [addressCoords, setAddressCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [addressMode, setAddressMode] = useState<"map" | "manual">("map");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
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

  // Fetch logged-in user email and addresses
  useEffect(() => {
    const fetchUserAndAddresses = async () => {
      try {
        // 1. Fetch User Info
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();

        if (userData.user?.email) {
          setUserEmail(userData.user.email);
          setValue("email", userData.user.email);
        }

        if (userData.user) {
          const addressRes = await fetch("/api/customer/addresses");
          if (addressRes.ok) {
            const addresses = await addressRes.json();

            if (addresses && addresses.length > 0) {
              const defaultAddress =
                addresses.find(
                  (a: {
                    isDefault: boolean;
                    street: string;
                    city: string;
                    postalCode: string;
                    phoneNumber?: string;
                  }) => a.isDefault,
                ) || addresses[0];

              if (defaultAddress) {
                const fullAddress = [
                  defaultAddress.street,
                  defaultAddress.city,
                  defaultAddress.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ");

                setValue("address", fullAddress, { shouldValidate: true });

                if (defaultAddress.phoneNumber) {
                  setValue("phone", defaultAddress.phoneNumber, {
                    shouldValidate: true,
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUserAndAddresses();
  }, [setValue]);

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
            productImageId: item.productImageId,
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
      <section className="bg-card rounded-3xl p-6 lg:p-8 shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
            1
          </span>
          Identification
        </h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email *
            </label>
            <input
              type="email"
              {...form.register("email")}
              placeholder="votre@email.com"
              readOnly={!!userEmail}
              className={`w-full px-4 py-3 bg-secondary/5 rounded-xl border border-border text-foreground focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all ${userEmail ? "cursor-not-allowed opacity-70" : ""}`}
            />
            {userEmail && (
              <p className="text-xs text-muted-foreground">
                Email de votre compte
              </p>
            )}
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

      <section className="bg-card rounded-3xl p-6 lg:p-8 shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
            2
          </span>
          Livraison
        </h2>

        <div className="space-y-6">
          <div className="flex p-1 bg-secondary/10 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setAddressMode("map")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                addressMode === "map"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Carte interactive
            </button>
            <button
              type="button"
              onClick={() => setAddressMode("manual")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                addressMode === "manual"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Saisie manuelle
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {addressMode === "map"
                ? "Adresse de livraison"
                : "Entrez votre adresse exacte *"}
            </label>
            <div className="relative">
              <input
                type="text"
                {...form.register("address")}
                readOnly={addressMode === "map"}
                placeholder={
                  addressMode === "map"
                    ? "Sélectionnez votre position sur la carte"
                    : "Rue, quartier, ville..."
                }
                className={cn(
                  "w-full px-4 py-3 bg-secondary/5 rounded-xl border border-border text-foreground transition-all placeholder:text-muted-foreground/50",
                  addressMode === "map"
                    ? "cursor-not-allowed"
                    : "focus:border-primary focus:ring-2 focus:ring-primary/5 outline-none",
                )}
              />
            </div>
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>

          {addressMode === "map" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <AddressMap onAddressSelect={onAddressSelect} />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Complément d&apos;adresse (Cité, étage, porte...)
            </label>
            <input
              {...form.register("complement")}
              placeholder="Ex: Porte A, 2ème étage..."
              className="w-full px-4 py-3 bg-secondary/5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
        </div>
      </section>

      <section className="bg-card rounded-3xl p-6 lg:p-8 shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
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

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            className="text-sm text-muted-foreground hover:text-primary hover:underline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la boutique
          </Link>
        </div>
      </div>
    </form>
  );
}
