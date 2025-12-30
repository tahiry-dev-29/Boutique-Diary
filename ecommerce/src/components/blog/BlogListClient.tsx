"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye, ArrowRight, Sparkles, Loader2 } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string;
  viewCount: number;
  product: {
    id: number;
    name: string;
    brand: string | null;
    price: number;
    category: { name: string } | null;
  };
}

interface BlogListProps {
  initialPosts: BlogPost[];
}

export default function BlogList({ initialPosts }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Offset logic:
      // Server renders 1 featured + initialPosts.length (list).
      // Total items rendered before loadMore = 1 + posts.length.
      // So the next item starts at offset = 1 + posts.length.
      // Example: 1 featured, 19 in list. Total 20. Next offset should be 20. (Since offset is 0-indexed count).
      // Actually strictly speaking:
      // If we have 20 items (0..19), the next one is index 20.
      // So offset = current total count.
      const currentOffset = posts.length + 1; // +1 for the featured post

      const nextPosts = await fetch(
        `/api/blog?limit=${limit}&offset=${currentOffset}&excludeFeatured=true`,
      ).then((res) => res.json());

      if (nextPosts.posts && nextPosts.posts.length > 0) {
        setPosts((prev) => {
          // Ensure no duplicates just in case
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewPosts = nextPosts.posts.filter(
            (p: BlogPost) => !existingIds.has(p.id),
          );
          return [...prev, ...uniqueNewPosts];
        });
        if (nextPosts.posts.length < limit) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more posts", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-10">
        Tous nos articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                {post.product.category && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 dark:bg-black/80 backdrop-blur-sm rounded-full text-xs font-bold text-gray-900 dark:text-white">
                    {post.product.category.name}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.viewCount}
                    </span>
                  </div>
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Lire
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                Voir plus d&apos;articles
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
