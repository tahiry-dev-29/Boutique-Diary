"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  MessageSquarePlus,
  Search,
  Check,
  Star,
  Package,
  ChevronRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/cart-store";

const reviewSchema = z.object({
  productId: z.string().min(1, "Veuillez choisir un produit"),
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(10, "Le commentaire doit faire au moins 10 caractères"),
});

type GlobalReviewFormValues = z.infer<typeof reviewSchema>;

export default function GlobalReviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const form = useForm<GlobalReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      productId: "",
      rating: 5,
      comment: "",
    },
  });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    } else {
      // Reset local states when closing
      setSelectedProduct(null);
      setSearchTerm("");
    }
  }, [isOpen]);

  async function fetchUser() {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products?limit=50");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  }

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(
      p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  async function onSubmit(values: GlobalReviewFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/products/${values.productId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: values.rating,
            comment: values.comment,
          }),
        },
      );

      if (response.ok) {
        toast.success("Votre avis a été publié ! ✨");
        setIsOpen(false);
        form.reset();
        setSelectedProduct(null);
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
    if (r === 5) return "Exceptionnel ! 😍";
    if (r === 4) return "Très bien ! 😊";
    if (r === 3) return "Pas mal. 🙂";
    if (r === 2) return "Moyen... 😐";
    return "Déçu. 😞";
  }, [form.watch("rating")]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          onClick={e => {
            if (!user) {
              e.preventDefault();
              toast.error("Veuillez vous connecter pour donner un avis");
            }
          }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageSquarePlus className="w-7 h-7 relative z-10" />
          <span className="absolute right-full mr-4 px-4 py-2 bg-white/80 backdrop-blur-md text-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap border border-white/50">
            Donner un avis
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-[28px] border-0 shadow-[0_32px_80px_rgba(0,0,0,0.15)] bg-white">
        {/* Premium Header Background */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white -z-10" />

        <div className="p-5">
          <DialogHeader className="mb-4">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-black/10 mx-auto">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <DialogTitle className="text-xl font-black tracking-tight text-center text-gray-900">
              Votre avis compte
            </DialogTitle>
            <p className="text-gray-500 text-center font-medium mt-1 text-xs">
              Aidez la communauté en partageant votre expérience
            </p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Product Selection Step */}
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Produit concerné
                    </FormLabel>

                    {!selectedProduct ? (
                      <div className="space-y-2">
                        <div className="relative group">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-black transition-colors" />
                          <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-100 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all font-medium text-xs"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                          />
                        </div>

                        <div className="max-h-[140px] overflow-y-auto pr-2 custom-scrollbar space-y-1.5">
                          {filteredProducts.length === 0 ? (
                            <div className="py-6 text-center text-gray-400 text-xs italic">
                              Aucun produit trouvé
                            </div>
                          ) : (
                            filteredProducts.map(product => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  field.onChange(product.id.toString());
                                }}
                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group text-left"
                              >
                                <div className="relative w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                  {product.images?.[0]?.url ? (
                                    <Image
                                      src={product.images[0].url}
                                      alt={product.name}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform"
                                    />
                                  ) : (
                                    <Package className="w-3.5 h-3.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 text-xs truncate">
                                    {product.name}
                                  </h4>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                    {product.category?.name || "Sans catégorie"}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-[10px] font-black text-gray-900">
                                    {formatPrice(product.price)}
                                  </div>
                                  <ChevronRight className="w-3 h-3 text-gray-300 ml-auto group-hover:text-black group-hover:translate-x-1 transition-all" />
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-2.5 bg-gray-900 text-white rounded-[16px] shadow-lg group">
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-white/10 flex-shrink-0">
                          {selectedProduct.images?.[0]?.url ? (
                            <Image
                              src={selectedProduct.images[0].url}
                              alt={selectedProduct.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs truncate">
                            {selectedProduct.name}
                          </h4>
                          <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">
                            {selectedProduct.category?.name ||
                              "Produit sélectionné"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(null);
                            field.onChange("");
                          }}
                          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rating Step */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center gap-2 pt-1">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Note globale
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

              {/* Comment Step */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Votre témoignage
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Qu'est-ce qui vous a plu ? Des points à améliorer ?"
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
                  disabled={isSubmitting || !selectedProduct}
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-[16px] py-6 font-black text-sm transition-all shadow-xl shadow-black/10 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 h-12"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Publication...</span>
                    </div>
                  ) : (
                    "Publier mon avis"
                  )}
                </Button>

                <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-3">
                  Diary E-commerce — Vos avis nous font grandir
                </p>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
