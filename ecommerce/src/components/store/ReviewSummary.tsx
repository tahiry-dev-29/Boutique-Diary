import StarRating from "./StarRating";
import { Star } from "lucide-react";

interface ReviewSummaryProps {
  rating: number;
  reviewCount: number;
  distribution: { [key: number]: number };
}

export default function ReviewSummary({
  rating,
  reviewCount,
  distribution,
}: ReviewSummaryProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-900">Avis Clients</h2>

      <div className="flex items-center gap-4">
        <StarRating rating={rating} size="lg" />
        <div className="flex flex-col">
          <span className="text-3xl font-black text-gray-900">
            {rating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 font-medium">
            {reviewCount} avis
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map(star => {
          const count = distribution[star] || 0;
          const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-4 group">
              <div className="flex items-center gap-1.5 min-w-[32px]">
                <span className="text-sm font-bold text-gray-700">{star}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-500 min-w-[24px] text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
