"use client";

import { useEffect, useState } from "react";
import ReviewSummary from "./ReviewSummary";
import ReviewItem from "./ReviewItem";
import ReviewForm from "./ReviewForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: number;
  initialRating: number;
  initialReviewCount: number;
}

export default function ProductReviews({
  productId,
  initialRating,
  initialReviewCount,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchReviews();
    fetchUser();
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
    } catch (error) {
      console.error("Failed to fetch user", error);
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
    } catch (error) {
      console.error("Failed to fetch reviews", error);
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

  // Calculate distribution
  const distribution = reviews.reduce((acc: any, review: any) => {
    const r = Math.round(review.rating);
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="bg-white py-16 px-4 md:px-6 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-24">
        {/* Left Column: Summary & CTA */}
        <div className="flex flex-col gap-12 sticky top-24 self-start">
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

        {/* Right Column: List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">
              {reviews.length} Avis vérifiés
            </h3>
            <div className="flex gap-2">
              {/* Filter Placeholder */}
              {["Récents", "Meilleures notes", "Utiles"].map(filter => (
                <button
                  key={filter}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold border transition-all",
                    filter === "Récents"
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-500 border-gray-100 hover:border-gray-300",
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
              </div>
            ) : reviews.length > 0 ? (
              reviews.map(review => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  onReaction={handleReaction}
                />
              ))
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
