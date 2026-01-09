"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormData } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  // Auto-fill email if user is logged in
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.user?.email) {
            setValue("email", data.user.email);
          }
        }
      } catch (error) {
        // Silently fail if session check fails
        console.log("No user session found");
      }
    };

    fetchUserSession();
  }, [setValue]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        toast.success("Message envoyé avec succès !", {
          description: "Nous vous répondrons dans les plus brefs délais.",
        });
        reset();
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        throw new Error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi", {
        description:
          error instanceof Error
            ? error.message
            : "Veuillez réessayer plus tard.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#f8f8f8] p-8 md:p-10 rounded-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-8 uppercase tracking-wide">
        CONTACTEZ-NOUS
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              NOM
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Votre nom*"
              className={`bg-white border-transparent focus:border-[#3d6b6b] h-12 ${errors.name ? "border-red-500" : ""}`}
              {...register("name")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              TÉLÉPHONE
            </label>
            <Input
              id="phone"
              type="text"
              placeholder="Votre numéro de téléphone*"
              className={`bg-white border-transparent focus:border-[#3d6b6b] h-12 ${errors.phone ? "border-red-500" : ""}`}
              {...register("phone")}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-bold text-gray-500 uppercase tracking-wider"
          >
            EMAIL
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Votre email*"
            className={`bg-white border-transparent focus:border-[#3d6b6b] h-12 ${errors.email ? "border-red-500" : ""}`}
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="text-xs font-bold text-gray-500 uppercase tracking-wider"
          >
            VOTRE MESSAGE
          </label>
          <Textarea
            id="message"
            rows={6}
            className={`bg-white border-transparent focus:border-[#3d6b6b] resize-none ${errors.message ? "border-red-500" : ""}`}
            {...register("message")}
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="text-sm text-red-500 mt-1">
              {errors.message.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="w-full md:w-auto px-10 py-6 font-bold uppercase tracking-wider text-sm rounded bg-[#3d6b6b] hover:bg-[#2d5555] text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Envoi...
            </>
          ) : isSuccess ? (
            "Message Envoyé"
          ) : (
            "ENVOYER LE MESSAGE"
          )}
        </Button>
      </form>
    </div>
  );
}
