import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import BlogListClient from "@/components/blog/BlogListClient";
import StoreProductBanner from "@/components/store/StoreProductBanner";
import { getStoreStats } from "@/lib/store-data";

export const metadata: Metadata = {
  title: "Blog | Boutique Diary",
  description: "Découvrez nos articles sur la mode et nos conseils de style",
};

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

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blog?limit=20`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const [posts, stats] = await Promise.all([getBlogPosts(), getStoreStats()]);
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="pt-4 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <StoreProductBanner
          title="Le Journal Boutique Diary"
          subtitle="Explorez nos articles de style, découvrez les tendances et trouvez l'inspiration pour sublimer votre garde-robe."
          badge="BLOG & LIFESTYLE"
          customerCount={stats.customerCount}
          recentCustomers={stats.recentCustomers}
          variant="emerald"
          enableTypewriter={true}
        />

        <div className="mb-12 border-b border-gray-100 dark:border-gray-800 pb-12 mt-12 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white border-l-4 border-emerald-500 pl-4">
              L&apos;univers Boutique Diary
            </h2>
            <p className="max-w-3xl text-sm font-medium text-gray-500 dark:text-gray-400">
              Plongez dans nos articles, nos conseils de mode et nos
              inspirations quotidiennes pour affirmer votre style.
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <section className="py-32 px-4">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Aucun article pour l&apos;instant
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Nos articles arrivent bientôt. En attendant, découvrez nos
                produits !
              </p>
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-transform"
              >
                Voir la boutique
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        ) : (
          <div className="space-y-20">
            {}
            {featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} className="group block">
                <article className="grid md:grid-cols-2 gap-8 items-center bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden p-2 border border-transparent hover:border-amber-500/20 transition-all">
                  {}
                  <div className="relative aspect-4/3 md:aspect-square rounded-2xl overflow-hidden">
                    {featuredPost.coverImage ? (
                      <Image
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-amber-100 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 flex items-center justify-center">
                        <Sparkles className="w-20 h-20 text-amber-500/30" />
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 bg-amber-400 text-black rounded-full text-sm font-bold uppercase tracking-wider">
                        À la une
                      </span>
                    </div>
                  </div>

                  {}
                  <div className="p-8 space-y-6">
                    {featuredPost.product.category && (
                      <span className="inline-block px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold uppercase tracking-wider">
                        {featuredPost.product.category.name}
                      </span>
                    )}
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredPost.publishedAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        {featuredPost.viewCount} vues
                      </span>
                    </div>
                    <div className="pt-4">
                      <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold group-hover:gap-4 transition-all">
                        Lire l&apos;article
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {}
            <BlogListClient initialPosts={otherPosts} />
          </div>
        )}
      </div>

      {}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-black dark:bg-white text-white dark:text-black rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Découvrez nos collections
              </h2>
              <p className="text-lg opacity-70 mb-8 max-w-xl mx-auto">
                Trouvez les pièces parfaites pour compléter votre style et
                affirmer votre personnalité.
              </p>
              <Link
                href="/produits"
                className="inline-flex items-center gap-3 px-8 py-4 bg-amber-400 text-black rounded-full font-bold hover:bg-amber-300 hover:scale-105 transition-all"
              >
                Explorer la boutique
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
