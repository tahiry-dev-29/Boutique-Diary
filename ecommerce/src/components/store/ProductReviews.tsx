"use client";

import { useEffect, useState, useMemo } from "react";
import ReviewSummary from "./ReviewSummary";
import ReviewItem from "./ReviewItem";
import ReviewForm from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

interface ProductReviewsProps {
  productId: number;
  initialRating: number;
  initialReviewCount: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  photo?: string | null;
}

interface InternalReview {
  id: number;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    username: string;
    photo?: string | null;
  };
  reactions?: { id: number; type: string; userId: string }[];
}

export default function ProductReviews({
  productId,
  initialRating,
  initialReviewCount,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<InternalReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Récents");
  const DISPLAY_LIMIT = 3;

  useEffect(() => {
    fetchReviews();
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function fetchUser() {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }

  const isLoggedIn = !!user;

  async function fetchReviews() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch {
      // Silently handle failure for guest or network issues
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReaction(reviewId: number, type: string) {
    if (!isLoggedIn) {
      toast.error("Veuillez vous connecter pour réagir");
      return;
    }
    try {
      const response = await fetch(`/api/reviews/${reviewId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Reaction failed", error);
    }
  }

  const distribution = reviews.reduce(
    (acc: Record<number, number>, review: InternalReview) => {
      const r = Math.round(review.rating);
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    },
    {},
  );

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (activeFilter) {
      case "Meilleures notes":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "Utiles":
        return sorted.sort(
          (a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0),
        );
      case "Récents":
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [reviews, activeFilter]);

  return (
    <section className="bg-white py-16 px-4 md:px-6 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-24">
        {}
        <div className="flex flex-col gap-12 static lg:sticky lg:top-24 lg:self-start">
          <ReviewSummary
            rating={initialRating}
            reviewCount={initialReviewCount}
            distribution={distribution}
          />

          <div className="space-y-4">
            {isLoggedIn ? (
              <ReviewForm productId={productId} onSuccess={fetchReviews} />
            ) : (
              <div className="flex flex-col gap-4">
                <Button
                  asChild
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-xl py-6 font-bold text-lg"
                >
                  <Link href="/login">Se connecter pour donner un avis</Link>
                </Button>
                <p className="text-center text-sm text-gray-500 font-medium">
                  Vous devez être connecté pour partager votre expérience.
                </p>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">
              {reviews.length} Avis vérifiés
            </h3>
            <div className="flex gap-2 flex-wrap">
              {["Récents", "Meilleures notes", "Utiles"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold border transition-all",
                    filter === activeFilter
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-500 border-gray-100 hover:border-gray-300",
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="flex flex-col gap-2">
                <ScrollArea
                  className={cn(
                    "transition-all duration-500",
                    isExpanded ? "h-[600px] pr-4" : "h-auto",
                  )}
                >
                  <div className="space-y-2">
                    {sortedReviews
                      .slice(
                        0,
                        isExpanded ? sortedReviews.length : DISPLAY_LIMIT,
                      )
                      .map((review) => (
                        <ReviewItem
                          key={review.id}
                          review={review}
                          onReaction={handleReaction}
                        />
                      ))}
                  </div>
                </ScrollArea>

                {!isExpanded && reviews.length > DISPLAY_LIMIT && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => setIsExpanded(true)}
                      variant="outline"
                      className="group flex items-center gap-2 px-8 py-6 border-2 border-gray-100 hover:border-black hover:bg-black hover:text-white rounded-2xl font-bold transition-all duration-300"
                    >
                      Voir plus d&apos;avis
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-[32px] p-20 text-center flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="text-gray-500 font-bold">
                  Aucun avis pour le moment.
                </p>
                <p className="text-sm text-gray-400">
                  Soyez le premier à partager votre expérience !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
