import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Eye,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string;
  viewCount: number;
  product: {
    id: number;
    name: string;
    reference: string;
    price: number;
    brand: string | null;
    images: { id: number; url: string; color: string | null }[];
    category: { name: string; slug: string } | null;
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blog/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    return { title: "Article non trouvé" };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Image */}
      {post.coverImage && (
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au blog
              </Link>
              {post.product.category && (
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-4 ml-4">
                  {post.product.category.name}
                </span>
              )}
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Article Content */}
          <article className="lg:col-span-2">
            {!post.coverImage && (
              <>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour au blog
                </Link>
                <h1 className="text-3xl md:text-4xl font-black text-foreground mb-6">
                  {post.title}
                </h1>
              </>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.viewCount} vues
              </span>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-8 font-medium leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Article Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-li:text-muted-foreground
                prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Sidebar - Product Card */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Product Image */}
              {post.product.images[0]?.url && (
                <div className="relative aspect-square">
                  <Image
                    src={post.product.images[0].url}
                    alt={post.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="p-6 space-y-4">
                <div>
                  {post.product.brand && (
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                      {post.product.brand}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-foreground mt-1">
                    {post.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Réf: {post.product.reference}
                  </p>
                </div>

                <p className="text-2xl font-black text-primary">
                  {formatMoney(post.product.price)}
                </p>

                {/* Color options */}
                {post.product.images.length > 1 && (
                  <div className="flex gap-2">
                    {post.product.images.slice(0, 4).map(img => (
                      <div
                        key={img.id}
                        className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600"
                      >
                        <Image
                          src={img.url}
                          alt={img.color || ""}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={`/store/products/${post.product.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Voir le produit
                </Link>
              </div>
            </div>

            {/* Share */}
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <p className="text-sm font-medium text-foreground mb-3">
                Partager
              </p>
              <div className="flex gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_URL || ""}/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-[#1877F2] text-white rounded-lg text-center text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_URL || ""}/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-black text-white rounded-lg text-center text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  X
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Back to blog CTA */}
      <section className="py-12 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-4">
            Découvrez plus d&apos;articles
          </h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </Link>
        </div>
      </section>
    </div>
  );
}
