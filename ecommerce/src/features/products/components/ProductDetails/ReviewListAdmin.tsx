"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewListAdminProps {
  productId: number;
}


const ReviewItemBase = ({
  review,
  handleDelete,
  handleReaction,
  handleReply,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  isSubmittingReply,
  index = 0,
}: any) => (
  <div
    style={{ animationDelay: `${index * 100}ms` }}
    className="py-8 flex gap-6 border-b border-gray-50/50 dark:border-gray-800 last:border-0 hover:bg-gray-50/20 dark:hover:bg-white/[0.02] transition-colors duration-300 px-4 -mx-4 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
  >
    <Avatar className="w-12 h-12 border border-gray-100 dark:border-gray-800 shadow-sm flex-shrink-0">
      <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold uppercase text-base">
        {review.user.username.substring(0, 2)}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-black text-gray-900 dark:text-white text-base">
            {review.user.username}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded">
            {format(new Date(review.createdAt), "PPP", { locale: fr })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex text-amber-500 gap-0.5 bg-amber-50/50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < review.rating
                    ? "fill-current"
                    : "text-gray-200 dark:text-gray-700 fill-transparent",
                )}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
            onClick={() => handleDelete(review.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium bg-gray-50/30 dark:bg-white/[0.03] p-4 rounded-2xl border border-gray-50/50 dark:border-gray-800/50">
        {review.comment}
      </p>

      <div className="flex items-center gap-4 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
          onClick={() =>
            setReplyingTo(replyingTo === review.id ? null : review.id)
          }
        >
          Répondre
        </Button>
        <div className="flex gap-2">
          {["LIKE", "LOVE"].map(type => {
            const hasReacted = review.reactions?.some(
              (r: any) => r.type === type,
            );
            const count =
              review.reactions?.filter((r: any) => r.type === type).length || 0;
            return (
              <button
                key={type}
                onClick={() => handleReaction(review.id, type)}
                className={cn(
                  "text-[10px] px-3 py-1.5 rounded-full flex items-center gap-2 transition-all border font-bold shadow-sm",
                  hasReacted
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white scale-105"
                    : "bg-white dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
                )}
              >
                <span className="text-xs">{type === "LIKE" ? "👍" : "❤️"}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {replyingTo === review.id && (
        <div className="pt-4 space-y-3 animate-in slide-in-from-top-4 duration-500 ease-out fill-mode-both">
          <textarea
            className="w-full p-5 rounded-[24px] bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-black/5 dark:focus:border-white/5 focus:bg-white dark:focus:bg-black text-sm min-h-[120px] font-medium resize-none transition-all shadow-inner"
            placeholder="Votre réponse officielle ici..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl font-bold text-xs px-6"
              onClick={() => setReplyingTo(null)}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className="bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-xs px-8 shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all"
              disabled={isSubmittingReply || !replyContent.trim()}
              onClick={() => handleReply(review.id)}
            >
              {isSubmittingReply ? "Envoi..." : "Envoyer la réponse"}
            </Button>
          </div>
        </div>
      )}

      {review.replies && review.replies.length > 0 && (
        <div className="mt-6 space-y-4 bg-gray-50/80 dark:bg-gray-900/50 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          {review.replies.map((reply: any) => (
            <div key={reply.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white flex items-center justify-center flex-shrink-0 text-[11px] font-black text-white dark:text-black shadow-xl shadow-black/20 dark:shadow-white/5">
                {reply.admin?.name?.substring(0, 2).toUpperCase() || "EQ"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    {reply.admin?.name || "Support Client"}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold bg-white dark:bg-black/50 px-2 py-0.5 rounded shadow-sm">
                    {format(new Date(reply.createdAt), "p", { locale: fr })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3">
          {(review.tags as string[]).map(tag => (
            <span
              key={tag}
              className="text-[10px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-1 rounded-full text-gray-500 font-bold shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

export function ReviewListAdmin({ productId }: ReviewListAdminProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const LIMIT = 4;
  const displayedReviews = showAll ? reviews : reviews.slice(0, LIMIT);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

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

  async function handleReply(reviewId: number) {
    if (!replyContent.trim()) return;
    setIsSubmittingReply(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });

      if (response.ok) {
        toast.success("Réponse publiée");
        setReplyContent("");
        setReplyingTo(null);
        fetchReviews(); // Refresh to show the new reply
      } else {
        toast.error("Échec de l'envoi");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setIsSubmittingReply(false);
    }
  }

  async function handleReaction(reviewId: number, type: string) {
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

  async function handleDelete(reviewId: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Avis supprimé");
        setReviews(reviews.filter(r => r.id !== reviewId));
      } else {
        toast.error("Échec de la suppression");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <div className="bg-gray-100 p-4 rounded-full">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Aucun avis pour le moment
        </h3>
        <p className="text-gray-500 max-w-sm">
          Les avis clients s&apos;afficheront ici une fois que vos clients
          commenceront à noter ce produit.
        </p>
      </div>
    );
  }

  const initialReviews = reviews.slice(0, LIMIT);
  const remainingReviews = reviews.slice(LIMIT);

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "px-1",
          showAll
            ? "max-h-[400px] overflow-y-auto pr-4 custom-scrollbar bg-gray-50/10 dark:bg-white/[0.01] rounded-[32px] p-6 shadow-inner border border-gray-100/50 dark:border-gray-800/50"
            : "max-h-none",
        )}
      >
        <div className="space-y-4">
          {initialReviews.map((review, index) => (
            <ReviewItemBase
              key={review.id}
              review={review}
              handleDelete={handleDelete}
              handleReaction={handleReaction}
              handleReply={handleReply}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              isSubmittingReply={isSubmittingReply}
              index={index}
            />
          ))}
        </div>

        {showAll && remainingReviews.length > 0 && (
          <div className="space-y-4">
            {remainingReviews.map((review, index) => (
              <ReviewItemBase
                key={review.id}
                review={review}
                handleDelete={handleDelete}
                handleReaction={handleReaction}
                handleReply={handleReply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                isSubmittingReply={isSubmittingReply}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {reviews.length > LIMIT && (
        <div className="pt-6 mt-4 border-t border-gray-50 dark:border-gray-800">
          <Button
            variant="ghost"
            className="w-full rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] py-8 text-gray-400 hover:text-black hover:bg-gray-50 transition-all group"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              "Voir moins d'avis"
            ) : (
              <span className="flex items-center gap-2">
                Voir tous les avis
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md group-hover:bg-black group-hover:text-white transition-colors">
                  {reviews.length}
                </span>
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
