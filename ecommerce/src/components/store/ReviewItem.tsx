import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import StarRating from "./StarRating";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReviewItemProps {
  review: {
    id: number;
    rating: number;
    comment: string;
    isVerified: boolean;
    createdAt: string;
    user: {
      username: string;
      photo?: string | null;
    };
    replies?: any[];
    reactions?: any[];
  };
  onReaction?: (reviewId: number, type: string) => void;
}

export default function ReviewItem({ review, onReaction }: ReviewItemProps) {
  return (
    <div className="py-8 border-b border-gray-100 last:border-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
            {review.user.photo && <AvatarImage src={review.user.photo} />}
            <AvatarFallback className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
              {review.user.username.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">
                {review.user.username}
              </span>
              {review.isVerified && (
                <div className="bg-blue-50 text-blue-600 rounded-full p-0.5">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {format(new Date(review.createdAt), "PPP 'à' p", { locale: fr })}
            </span>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {review.comment}
      </p>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1.5">
          {["LIKE", "LOVE"].map(type => {
            const count =
              review.reactions?.filter(r => r.type === type).length || 0;
            return (
              <button
                key={type}
                onClick={() => onReaction?.(review.id, type)}
                className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-black transition-all flex items-center gap-1.5 border border-transparent hover:border-gray-200"
              >
                <span>{type === "LIKE" ? "👍" : "❤️"}</span>
                {count > 0 && <span className="font-bold">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {review.replies && review.replies.length > 0 && (
        <div className="mt-4 space-y-4 ml-8 pl-6 border-l-2 border-gray-50">
          {review.replies.map((reply: any) => (
            <div key={reply.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6 ring-1 ring-gray-100 shadow-sm transition-transform hover:scale-110">
                  {reply.admin?.photo || reply.user?.photo ? (
                    <AvatarImage
                      src={reply.admin?.photo || reply.user?.photo}
                    />
                  ) : null}
                  <AvatarFallback className="text-[8px] bg-black text-white font-bold">
                    {(reply.admin?.name || reply.user?.username || "?")
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-black text-gray-900">
                  {reply.admin?.name || reply.user?.username || "Equipe Diary"}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {format(new Date(reply.createdAt), "p", { locale: fr })}
                </span>
              </div>
              <p className="text-sm text-gray-600 pl-8 leading-relaxed">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
