"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  Package,
  Wand2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  publishedAt: string | null;
  product: {
    id: number;
    name: string;
    reference: string;
    price: number;
    images: { url: string }[];
  };
}

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/admin/blog/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
          setTitle(data.title);
          setExcerpt(data.excerpt || "");
          setContent(data.content);
          setMetaTitle(data.metaTitle || "");
          setMetaDescription(data.metaDescription || "");
          setIsPublished(data.isPublished);
        } else {
          toast.error("Article non trouvé");
          router.push("/admin/blog");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [resolvedParams.id, router]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Le titre et le contenu sont requis");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          metaTitle,
          metaDescription,
          isPublished,
        }),
      });

      if (res.ok) {
        toast.success("Article enregistré");
        const updated = await res.json();
        setPost(updated);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setShowRegenerateConfirm(false);
    setRegenerating(true);

    try {
      const res = await fetch(
        `/api/admin/blog/${resolvedParams.id}/regenerate`,
        {
          method: "POST",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la régénération");
      }

      // Update form with new content
      setTitle(data.blogPost.title);
      setExcerpt(data.blogPost.excerpt || "");
      setContent(data.blogPost.content);
      setMetaTitle(data.blogPost.metaTitle || "");
      setMetaDescription(data.blogPost.metaDescription || "");

      toast.success("✨ Contenu régénéré avec succès !");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erreur de régénération",
      );
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/blog">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Modifier l&apos;article
              </h1>
              <p className="text-sm text-muted-foreground">
                {post.product.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {post.isPublished && (
              <Button variant="outline" asChild>
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir
                </a>
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Magic Regenerate Button */}
            <div className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900 dark:text-amber-100">
                      Régénération IA
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Générer un nouveau contenu avec Gemini AI
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowRegenerateConfirm(true)}
                  disabled={regenerating}
                  className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                >
                  {regenerating ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  {regenerating ? "Génération..." : "Régénérer"}
                </Button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Titre de l'article"
                className="text-lg font-medium"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Extrait</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Résumé court de l'article..."
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                {excerpt.length}/160 caractères
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Contenu (HTML)</Label>
                <span className="text-xs text-muted-foreground">
                  Utilise les balises HTML: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;,
                  &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;
                </span>
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="<h2>Introduction</h2><p>...</p>"
                rows={20}
                className="font-mono text-sm"
              />
            </div>

            {/* Content Preview */}
            <div className="space-y-2">
              <Label>Aperçu du contenu</Label>
              <div
                className="prose prose-sm dark:prose-invert max-w-none p-6 bg-white dark:bg-gray-900 rounded-xl border border-border"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Produit associé
              </h3>
              {post.product.images?.[0]?.url && (
                <Image
                  src={post.product.images[0].url}
                  alt={post.product.name}
                  width={200}
                  height={200}
                  className="rounded-lg w-full object-cover aspect-square"
                />
              )}
              <div>
                <p className="font-medium">{post.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {post.product.reference}
                </p>
                <p className="text-sm font-medium mt-1">
                  {post.product.price.toLocaleString()} MGA
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/admin/products/${post.product.id}`}>
                  Voir le produit
                </Link>
              </Button>
            </div>

            {/* Publish Settings */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-4">
              <h3 className="font-medium">Publication</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPublished ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>{isPublished ? "Publié" : "Brouillon"}</span>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Vues: {post.viewCount}</p>
                <p>
                  Créé: {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                </p>
                {post.publishedAt && (
                  <p>
                    Publié:{" "}
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-4">
              <h3 className="font-medium">SEO</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    placeholder="Titre SEO"
                  />
                  <p className="text-xs text-muted-foreground">
                    {metaTitle.length}/60 caractères
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    placeholder="Description SEO..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {metaDescription.length}/155 caractères
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog
        open={showRegenerateConfirm}
        onOpenChange={setShowRegenerateConfirm}
      >
        <AlertDialogContent className="bg-gray-100 dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-500" />
              Régénérer le contenu ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va remplacer le titre, l&apos;extrait, le contenu et
              les métadonnées SEO actuels par un nouveau contenu généré par
              Gemini AI basé sur les informations du produit.
              <br />
              <br />
              <strong>Cette action est irréversible.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerate}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Régénérer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
