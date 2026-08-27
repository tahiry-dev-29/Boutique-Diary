import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Eye,
  ShoppingBag,
  Share2,
  Star,
  Clock,
} from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

function estimateReadTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
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

  const readTime = estimateReadTime(post.content);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      maximumFractionDigits: 0,
    }).format(amount);

  const shareUrl = `${process.env.NEXT_PUBLIC_URL || ""}/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      {post.coverImage && (
        <section className="relative h-[50vh] md:h-[60vh] lg:h-[65vh] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="100vw"
            quality={90}
            className="object-cover"
            priority
            unoptimized
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          {/* Content over hero */}
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 md:pb-14">
              {/* Navigation + Badge */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Button
                  asChild
                  className="rounded-full h-12 px-8 min-w-[180px] font-bold text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Link href="/blog">
                    <ArrowLeft className="w-5 h-5" />
                    Retour au blog
                  </Link>
                </Button>
                {post.product.category && (
                  <Badge className="h-12 px-8 min-w-[180px] text-sm font-bold uppercase tracking-widest shadow-lg shadow-black/20 border-none bg-primary text-primary-foreground">
                    {post.product.category.name}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight max-w-4xl">
                {post.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mt-6 text-white/70 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {post.viewCount} vues
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readTime} min de lecture
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 py-10 md:py-16">
          {/* Article */}
          <article className="min-w-0">
            {/* Fallback header when no cover */}
            {!post.coverImage && (
              <div className="mb-10">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full h-11 px-8 min-w-[180px] font-bold text-sm shadow-sm transition-all"
                  >
                    <Link href="/blog">
                      <ArrowLeft className="w-4 h-4" />
                      Retour au blog
                    </Link>
                  </Button>
                  {post.product.category && (
                    <Badge
                      variant="secondary"
                      className="h-11 px-8 min-w-[180px] text-sm font-bold uppercase tracking-wider border-none"
                    >
                      {post.product.category.name}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight mb-6">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {post.viewCount} vues
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {readTime} min de lecture
                  </span>
                </div>
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <blockquote className="relative pl-6 border-l-4 border-primary mb-10">
                <p className="text-lg md:text-xl text-primary font-medium leading-relaxed italic">
                  {post.excerpt}
                </p>
              </blockquote>
            )}

            <Separator className="mb-10" />

            {/* Article content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none text-justify
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground prose-headings:mb-4 prose-headings:mt-10
                prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:border-b prose-h2:border-gray-100 prose-h2:dark:border-gray-800 prose-h2:pb-3
                prose-h3:text-xl prose-h3:md:text-2xl
                prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-[1.9] prose-p:mb-6 prose-p:text-base prose-p:md:text-lg
                prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-li:leading-relaxed prose-li:my-1
                prose-strong:text-foreground prose-strong:font-bold
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-6 prose-ol:pl-6
                prose-blockquote:border-l-primary/40 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-900 prose-blockquote:rounded-r-xl prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8 prose-img:border prose-img:border-gray-100 dark:prose-img:border-gray-800"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content),
              }}
            />

            {/* Share section (mobile) */}
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 lg:hidden">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  Partager cet article
                </span>
              </div>
              <div className="flex gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-[#1877F2] text-white rounded-xl text-center text-sm font-medium hover:bg-[#1565c0] transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl text-center text-sm font-medium hover:bg-black dark:hover:bg-gray-600 transition-colors"
                >
                  X
                </a>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-6">
            {/* Product Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Product image */}
              {post.product.images[0]?.url && (
                <div className="relative aspect-square bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={post.product.images[0].url}
                    alt={post.product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 380px"
                    quality={90}
                    className="object-cover"
                    unoptimized
                  />
                  {/* Subtle gradient at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/20 to-transparent dark:from-gray-900/30" />
                </div>
              )}

              {/* Product info */}
              <div className="p-5 space-y-4">
                {/* Brand + Category */}
                <div className="flex items-center justify-between">
                  {post.product.brand && (
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">
                      {post.product.brand}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                </div>

                {/* Product name */}
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  {post.product.name}
                </h3>

                <p className="text-xs text-muted-foreground">
                  Réf: {post.product.reference}
                </p>

                <Separator />

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">
                    {formatMoney(post.product.price)}
                  </span>
                </div>

                {/* Color variants */}
                {post.product.images.length > 1 && (
                  <div className="flex gap-2">
                    {post.product.images.slice(0, 4).map(img => (
                      <div
                        key={img.id}
                        className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 hover:border-primary transition-colors cursor-pointer"
                      >
                        <Image
                          src={img.url}
                          alt={img.color || "Variante"}
                          width={48}
                          height={48}
                          quality={80}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-xl h-12 text-base font-bold gap-2.5 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  <Link href={`/store/product/${post.product.id}`}>
                    <ShoppingBag className="w-5 h-5" />
                    Voir le produit
                  </Link>
                </Button>
              </div>
            </div>

            {/* Share Card (desktop) */}
            <div className="hidden lg:block bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5 mb-4">
                <Share2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold text-foreground">
                  Partager
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-[#1877F2] text-white rounded-xl text-center text-sm font-medium hover:bg-[#1565c0] transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl text-center text-sm font-medium hover:bg-black dark:hover:bg-gray-600 transition-colors"
                >
                  X
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">
            Envie d&apos;en découvrir plus ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Explorez nos autres articles pour trouver des conseils beauté,
            tendances et inspirations.
          </p>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-12 text-base font-semibold gap-2"
          >
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4" />
              Tous les articles
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
