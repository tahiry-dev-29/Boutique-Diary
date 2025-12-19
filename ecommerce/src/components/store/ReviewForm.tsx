"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Sparkles } from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(10, "Le commentaire doit faire au moins 10 caractères"),
  tags: z.array(z.string()),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const PREDEFINED_TAGS = [
  "Qualité Premium",
  "Design Exceptionnel",
  "Rapport Qualité/Prix",
  "Livraison Rapide",
  "Service Client Top",
  "Totalement Conforme",
];

interface ReviewFormProps {
  productId: number;
  onSuccess: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
      tags: [],
    },
  });

  async function onSubmit(values: ReviewFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success("Avis publié ! Merci pour votre retour ✨");
        setIsOpen(false);
        form.reset();
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "Une erreur est survenue");
      }
    } catch (err) {
      toast.error("Erreur de connexion");
    } finally {
      setIsSubmitting(false);
    }
  }

  const ratingLabel = useMemo(() => {
    const r = form.watch("rating");
    if (r === 5) return "L'excellence absolue ! 😍";
    if (r === 4) return "Très bon produit ! 😊";
    if (r === 3) return "Satisfait dans l'ensemble 🙂";
    if (r === 2) return "Peut mieux faire... 😐";
    return "Déçu de mon achat 😞";
  }, [form.watch("rating")]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-[24px] py-8 font-black text-xl shadow-2xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <span className="relative z-10">Partager mon expérience</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-[28px] border-0 shadow-[0_32px_80px_rgba(0,0,0,0.15)] bg-white">
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-amber-50/50 via-rose-50/30 to-white -z-10" />

        <div className="p-5">
          <DialogHeader className="mb-4">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-black/10 mx-auto">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <DialogTitle className="text-xl font-black tracking-tight text-center text-gray-900">
              Comment était l'article ?
            </DialogTitle>
            <p className="text-gray-500 text-center font-medium mt-1 text-xs">
              Votre avis compte énormément pour nous et nos clients
            </p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center gap-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Votre Note
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center gap-1.5">
                        <StarRating
                          rating={field.value}
                          interactive
                          size="md"
                          onRatingChange={field.onChange}
                        />
                        <span className="text-xs font-black text-gray-900 transition-all animate-in fade-in slide-in-from-bottom-1">
                          {ratingLabel}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Les points forts ?
                </FormLabel>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map(tag => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-all border border-transparent has-[:checked]:border-black has-[:checked]:bg-white has-[:checked]:shadow-lg has-[:checked]:shadow-black/5"
                    >
                      <Checkbox
                        className="hidden"
                        checked={form.watch("tags").includes(tag)}
                        onCheckedChange={checked => {
                          const current = form.getValues("tags");
                          if (checked) {
                            form.setValue("tags", [...current, tag]);
                          } else {
                            form.setValue(
                              "tags",
                              current.filter(t => t !== tag),
                            );
                          }
                        }}
                      />
                      <span className="text-[10px] font-bold text-gray-700">
                        {tag}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Détails de votre expérience
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Racontez-nous tout..."
                        className="min-h-[80px] rounded-[16px] bg-gray-50/50 border-gray-100 focus-visible:ring-black focus-visible:bg-white placeholder:text-gray-400 font-medium text-xs p-3.5 resize-none transition-all shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2 pb-0">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-[16px] py-6 font-black text-sm transition-all shadow-xl shadow-black/10 hover:scale-[1.01] active:scale-[0.98] h-12"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Publication...</span>
                    </div>
                  ) : (
                    "Publier l'avis"
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="h-[1px] w-6 bg-gray-100" />
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                    Boutique Diary
                  </p>
                  <div className="h-[1px] w-6 bg-gray-100" />
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
