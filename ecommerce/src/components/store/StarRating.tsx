"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}

export default function StarRating({
  rating,
  max = 5,
  size = "md",
  onRatingChange,
  interactive = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-7 h-7",
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHoverRating(null)}
    >
      {stars.map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          className={cn(
            "transition-all duration-300",
            interactive ? "hover:scale-125 cursor-pointer" : "cursor-default",
          )}
        >
          <Star
            className={cn(
              "transition-colors duration-300",
              iconSizes[size],
              star <= currentDisplayRating
                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                : "fill-gray-100 text-gray-200",
              interactive && star <= (hoverRating ?? 0) && "scale-110",
            )}
            strokeWidth={star <= currentDisplayRating ? 1 : 2}
          />
        </button>
      ))}
    </div>
  );
}
