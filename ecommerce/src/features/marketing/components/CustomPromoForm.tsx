"use client";

import { useActionState, useState, useEffect, useMemo } from "react";
import { addDays, addMonths, format } from "date-fns";
import {
  createCustomPromoAction,
  type ActionState,
} from "../../../app/actions/marketing-actions";
import {
  calculateActivationPrice,
  createCustomPromoSchema,
} from "@/features/marketing/promo-logic";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Sparkles,
  Calendar,
  CreditCard,
  RefreshCw,
  Percent,
  Banknote,
  Clock,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PromoCode } from "@/features/marketing/types";
import PaymentMethods, {
  PaymentMethod,
} from "@/components/checkout/PaymentMethods";

interface CustomPromoFormProps {
  onSuccess?: (promo: PromoCode) => void;
  renewPromo?: PromoCode | null;
}

const PROMO_PRICE = 15000; // 15,000 Ar

/**
 * Form component for personalized promo codes with real payment.
 * @since 2026
 */
export function CustomPromoForm({
  onSuccess,
  renewPromo,
}: CustomPromoFormProps) {
  const [state, action, isPending] = useActionState<
    ActionState | undefined,
    FormData
  >(createCustomPromoAction, undefined);
  const [showPayment, setShowPayment] = useState(!!renewPromo);
  const [createdPromo, setCreatedPromo] = useState<PromoCode | null>(
    renewPromo || null,
  );

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [mvolaPhone, setMvolaPhone] = useState("");
  const [mvolaName, setMvolaName] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // New state for dynamic features
  const [discountType, setDiscountType] = useState<
    "PERCENTAGE" | "FIXED_AMOUNT"
  >("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(20);
  const [duration, setDuration] = useState("1_MONTH");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [isManualPrice, setIsManualPrice] = useState(false);
  const [manualPrice, setManualPrice] = useState<number>(PROMO_PRICE);

  // Auto-calculate endDate
  useEffect(() => {
    try {
      const start = new Date(startDate);
      let end = new Date(startDate);
      if (duration === "1_WEEK") end = addDays(start, 7);
      else if (duration === "1_MONTH") end = addMonths(start, 1);
      else if (duration === "3_MONTHS") end = addMonths(start, 3);
      else if (duration === "1_YEAR") end = addMonths(start, 12);
      setEndDate(format(end, "yyyy-MM-dd"));
    } catch (e) {
      console.error("Date calc error:", e);
    }
  }, [startDate, duration]);

  // Auto-calculate price
  const calculatedPrice = useMemo(() => {
    return calculateActivationPrice(duration, discountType, discountValue);
  }, [duration, discountType, discountValue]);

  const finalPrice = isManualPrice ? manualPrice : calculatedPrice;

  // Robust handling of server action state
  useEffect(() => {
    if (state?.success && state.promo) {
      setCreatedPromo(state.promo);
      setShowPayment(true);
      // onSuccess callback removed from here to separate concerns.
      // It will be called after payment success.
    } else if (state?.errors) {
      setShowPayment(false);
      const firstError = Object.values(state.errors)[0];
      if (firstError) toast.error(firstError);
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  const handlePaymentSubmit = async () => {
    if (!createdPromo || !paymentMethod) {
      toast.error("Veuillez sélectionner un moyen de paiement");
      return;
    }

    if (paymentMethod === "mvola" && (!mvolaPhone || !mvolaName)) {
      toast.error("Veuillez remplir les informations MVola");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Call payment webhook to activate
      const res = await fetch("/api/webhooks/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoId: createdPromo.id,
          status: "SUCCESS",
          provider: paymentMethod.toUpperCase(),
          metadata: {
            mvolaPhone,
            mvolaName,
            amount: finalPrice,
          },
        }),
      });

      if (res.ok) {
        toast.success(
          "Paiement validé ! Votre code est maintenant actif et les prix de vos produits ont été recalculés.",
        );
        setShowPayment(false);
        setCreatedPromo(null);
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error || "Échec du paiement");
      }
    } catch {
      toast.error("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden mb-8">
      <div className="p-6 lg:p-8">
        {!showPayment ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {renewPromo
                    ? "Renouveler mon code"
                    : "Acheter mon code personnalisé"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Créez et activez votre propre code promo dynamique.
                </p>
              </div>
            </div>

            <form action={action} className="space-y-6">
              {/* Row 1: Code Name & Discount Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2 col-span-1 md:col-span-1">
                  <label className="text-sm font-semibold text-foreground/80 ml-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Nom du code
                  </label>
                  <input type="hidden" name="duration" value={duration} />
                  <input
                    name="codeName"
                    placeholder="Ex: CODE123"
                    defaultValue={renewPromo?.code || ""}
                    className={cn(
                      "w-full px-4 py-3 bg-secondary/5 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all uppercase font-mono font-bold text-lg",
                      state?.errors?.codeName &&
                        "border-rose-500 focus:ring-rose-500/10",
                    )}
                    required
                  />
                </div>

                <div className="space-y-2 col-span-1 md:col-span-1 text-xs">
                  <label className="text-sm font-semibold text-foreground/80 ml-1 flex items-center gap-2">
                    Type de réduction
                  </label>
                  <input
                    type="hidden"
                    name="discountType"
                    value={discountType}
                  />
                  <div className="flex p-1 bg-secondary/10 rounded-2xl border border-border h-[52px]">
                    <button
                      type="button"
                      onClick={() => setDiscountType("PERCENTAGE")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-xl transition-all text-[12px] font-bold",
                        discountType === "PERCENTAGE"
                          ? "bg-background text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-background/50",
                      )}
                    >
                      <Percent className="w-4 h-4" />
                      Pourcentage
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("FIXED_AMOUNT")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-xl transition-all text-xs font-bold",
                        discountType === "FIXED_AMOUNT"
                          ? "bg-background text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-background/50",
                      )}
                    >
                      <Banknote className="w-4 h-4" />
                      Montant Fixe
                    </button>
                  </div>
                </div>

                <div className="space-y-2 col-span-1 md:col-span-1">
                  <label className="text-sm font-semibold text-foreground/80 ml-1 flex items-center gap-2">
                    Valeur
                  </label>
                  <div className="relative">
                    <input
                      name="discountValue"
                      type="number"
                      min={discountType === "PERCENTAGE" ? 2 : 2000}
                      max={discountType === "PERCENTAGE" ? 20 : 100000}
                      value={discountValue}
                      onChange={e => {
                        const val = Number(e.target.value);
                        // Immediate senior clamping for UX
                        if (discountType === "PERCENTAGE" && val > 20) {
                          setDiscountValue(20);
                          toast.warning("La réduction maximum est de 20%");
                        } else if (
                          discountType === "FIXED_AMOUNT" &&
                          val > 100000
                        ) {
                          setDiscountValue(100000);
                          toast.warning("Le montant maximum est de 100 000 Ar");
                        } else {
                          setDiscountValue(val);
                        }
                      }}
                      className={cn(
                        "w-full px-4 py-3 bg-secondary/5 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg pr-12",
                        state?.errors?.discountValue &&
                          "border-rose-500 focus:ring-rose-500/10",
                      )}
                      required
                    />
                    <span className="absolute right-4 top-3.5 font-bold text-muted-foreground">
                      {discountType === "PERCENTAGE" ? "%" : "Ar"}
                    </span>
                  </div>
                  {state?.errors?.discountValue && (
                    <p className="text-[11px] text-rose-600 ml-1 mt-1 font-bold animate-in fade-in slide-in-from-top-1 duration-200">
                      {state.errors.discountValue}
                    </p>
                  )}
                  {discountType === "PERCENTAGE" && discountValue > 20 && (
                    <p className="text-[10px] text-rose-600 ml-1 mt-1 italic animate-pulse">
                      Attention: Limité à 20%
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Duration & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80 ml-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Durée
                  </label>
                  <select
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/5 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="1_WEEK">1 Semaine</option>
                    <option value="1_MONTH">1 Mois</option>
                    <option value="3_MONTHS">3 Mois</option>
                    <option value="1_YEAR">1 An</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80 ml-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Début
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/5 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80 ml-1 flex items-center gap-2">
                    Fin (Automatique)
                  </label>
                  <input
                    name="endDate"
                    type="date"
                    value={endDate}
                    readOnly
                    className="w-full px-4 py-3 bg-secondary/10 rounded-2xl border border-border text-muted-foreground font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-6 bg-primary/5 rounded-[32px] border border-primary/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      Prix de l&apos;activation
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Calculé selon la durée et l&apos;importance de la
                      réduction.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManualPrice(!isManualPrice)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isManualPrice
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80",
                    )}
                    title="Modifier manuellement le prix"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  {isManualPrice ? (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <input
                        type="number"
                        value={manualPrice}
                        onChange={e => setManualPrice(Number(e.target.value))}
                        className="w-full px-6 py-4 bg-background rounded-2xl border-2 border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-2xl text-primary"
                      />
                      <span className="absolute right-6 top-4.5 font-black text-2xl text-primary/40">
                        Ar
                      </span>
                    </div>
                  ) : (
                    <div className="w-full px-6 py-4 bg-background/50 rounded-2xl border border-primary/20 flex items-center justify-between group transition-all">
                      <span className="text-muted-foreground font-medium capitalize">
                        {duration.replace("_", " ").toLowerCase()}
                      </span>
                      <span className="font-black text-3xl text-primary">
                        {calculatedPrice.toLocaleString("fr-FR")} Ar
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-6 sm:py-8 rounded-[20px] sm:rounded-[24px] font-black text-lg sm:text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    {renewPromo ? "Renouveler" : "Créer et payer mon code"}
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-[24px] sm:rounded-[32px] flex items-center justify-center mx-auto mb-4 sm:mb-6 transform rotate-3">
                <CreditCard className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-foreground">
                Finaliser le paiement
              </h2>
              <p className="text-muted-foreground mt-3 max-w-sm mx-auto text-lg">
                Votre code{" "}
                <span className="font-mono font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">
                  {createdPromo?.code}
                </span>{" "}
                est prêt.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full font-bold">
                Total à payer: {finalPrice.toLocaleString("fr-FR")} Ar
              </div>
            </div>

            {/* Reuse existing PaymentMethods component */}
            <PaymentMethods
              selected={paymentMethod}
              onChange={setPaymentMethod}
              mvolaPhone={mvolaPhone}
              onMvolaPhoneChange={setMvolaPhone}
              mvolaName={mvolaName}
              onMvolaNameChange={setMvolaName}
            />

            <div className="mt-8 sm:mt-10 flex flex-col gap-4">
              <Button
                onClick={handlePaymentSubmit}
                disabled={!paymentMethod || isProcessingPayment}
                className="w-full py-6 sm:py-8 rounded-[20px] sm:rounded-[24px] font-black text-lg sm:text-xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  `Confirmer le paiement (${finalPrice.toLocaleString("fr-FR")} Ar)`
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPayment(false);
                  setCreatedPromo(null);
                }}
                className="text-muted-foreground"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
