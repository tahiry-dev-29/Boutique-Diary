"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Sparkles,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  publishedAt: string | null;
  product: {
    id: number;
    name: string;
    reference: string;
    images: { url: string }[];
  };
}

interface Product {
  id: number;
  realProductId?: number;
  name: string;
  reference: string;
  brand: string | null;
  images: { id: number; url: string; reference?: string | null }[];
  blogPosts: { id: number; productImageId: number | null }[];
  _variantImageId?: number; 
}

export default function AdminBlogPage() {
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [view, setView] = useState<"posts" | "products">("posts");
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  
  const filteredProducts = useMemo(() => {
    return products.filter(
      p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [products, searchQuery]);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (statusFilter === "published" && !p.isPublished) return false;
      if (statusFilter === "draft" && p.isPublished) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query) ||
          p.product.name.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [posts, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  
  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch {
      toast.error("Échec de la récupération des articles");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=1000");
      if (res.ok) {
        const data = await res.json();
        const allProducts = Array.isArray(data) ? data : data.products || [];
        const generatableItems: Product[] = [];

        allProducts.forEach((p: Product) => {
          const hasMainBlog = p.blogPosts?.some(bp => !bp.productImageId);
          if (!hasMainBlog) {
            generatableItems.push({ ...p, realProductId: p.id });
          }
          if (p.images && Array.isArray(p.images)) {
            p.images.forEach(img => {
              if (img.reference) {
                const hasVariantBlog = p.blogPosts?.some(
                  bp => bp.productImageId === img.id,
                );
                if (!hasVariantBlog) {
                  const syntheticId = p.id * 1000000 + img.id;
                  generatableItems.push({
                    ...p,
                    id: syntheticId,
                    realProductId: p.id,
                    name: `${p.name} - ${img.reference}`,
                    images: [img],
                    _variantImageId: img.id,
                  });
                }
              }
            });
          }
        });
        setProducts(generatableItems);
      }
    } catch {
      toast.error("Échec de la récupération des produits");
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchProducts();
  }, []);

  const handleBulkGenerate = async () => {
    if (selectedProducts.length === 0) return;
    setGenerating(true);
    let successCount = 0;
    for (const uiId of selectedProducts) {
      try {
        const product = products.find(p => p.id === uiId);
        if (!product) continue;
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.realProductId || product.id,
            productImageId: product._variantImageId,
          }),
        });
        if (res.ok) successCount++;
      } catch (error) {
        console.error(`Failed to generate for product ${uiId}`, error);
      }
    }
    if (successCount > 0)
      toast.success(`${successCount} article(s) généré(s) !`);
    setGenerating(false);
    setShowGenerateModal(false);
    setSelectedProducts([]);
    fetchPosts();
    fetchProducts();
  };

  const handleGenerateSingle = async (product: Product) => {
    setGeneratingId(product.id);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.realProductId || product.id,
          productImageId: product._variantImageId,
        }),
      });
      if (res.ok) {
        toast.success(`Article généré pour ${product.name}`);
        fetchPosts();
        fetchProducts();
      } else {
        const error = await res.json();
        toast.error(error.error || "Échec de la génération");
      }
    } catch {
      toast.error("Erreur lors de la génération");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleRegenerate = async (blogId: number) => {
    setGeneratingId(blogId);
    try {
      const res = await fetch(`/api/admin/blog/${blogId}/regenerate`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Contenu régénéré !");
        fetchPosts();
      }
    } catch {
      toast.error("Erreur lors de la régénération");
    } finally {
      setGeneratingId(null);
    }
  };

  const toggleSelectAllPosts = () => {
    if (selectedPostIds.length === filteredPosts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(filteredPosts.map(p => p.id));
    }
  };

  const toggleSelectPost = (postId: number) => {
    setSelectedPostIds(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId],
    );
  };

  const handleBulkPostAction = async (
    action: "delete" | "publish" | "unpublish",
  ) => {
    if (selectedPostIds.length === 0) return;
    try {
      let res;
      if (action === "delete") {
        res = await fetch("/api/admin/blog", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedPostIds }),
        });
      } else {
        res = await fetch("/api/admin/blog", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedPostIds,
            data: { isPublished: action === "publish" },
          }),
        });
      }

      if (res.ok) {
        toast.success("Action effectuée !");
        setSelectedPostIds([]);
        fetchPosts();
        fetchProducts();
      }
    } catch {
      toast.error("Erreur lors de l'action de masse");
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId],
    );
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      if (res.ok) {
        toast.success(post.isPublished ? "Article dépublié" : "Article publié");
        fetchPosts();
      }
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/blog/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Article supprimé");
        fetchPosts();
        fetchProducts();
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setStatusFilter("all");
            setView("posts");
            setCurrentPage(1);
          }}
          className={`group bg-white dark:bg-gray-800 rounded-xl p-5 text-left border transition-all ${
            view === "posts" && statusFilter === "all"
              ? "border-primary ring-1 ring-primary shadow-md"
              : "border-transparent shadow-sm hover:border-gray-200 dark:hover:border-gray-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Articles
            </p>
            <FileText
              className={`w-4 h-4 ${view === "posts" && statusFilter === "all" ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <p className="text-3xl font-bold text-foreground">{posts.length}</p>
        </button>

        <button
          onClick={() => {
            setStatusFilter("published");
            setView("posts");
            setCurrentPage(1);
          }}
          className={`group bg-white dark:bg-gray-800 rounded-xl p-5 text-left border transition-all ${
            view === "posts" && statusFilter === "published"
              ? "border-green-500 ring-1 ring-green-500 shadow-md"
              : "border-transparent shadow-sm hover:border-green-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Publiés</p>
            <Eye
              className={`w-4 h-4 ${view === "posts" && statusFilter === "published" ? "text-green-500" : "text-muted-foreground"}`}
            />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {posts.filter(p => p.isPublished).length}
          </p>
        </button>

        <button
          onClick={() => {
            setStatusFilter("draft");
            setView("posts");
            setCurrentPage(1);
          }}
          className={`group bg-white dark:bg-gray-800 rounded-xl p-5 text-left border transition-all ${
            view === "posts" && statusFilter === "draft"
              ? "border-amber-500 ring-1 ring-amber-500 shadow-md"
              : "border-transparent shadow-sm hover:border-amber-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Brouillons
            </p>
            <Pencil
              className={`w-4 h-4 ${view === "posts" && statusFilter === "draft" ? "text-amber-500" : "text-muted-foreground"}`}
            />
          </div>
          <p className="text-3xl font-bold text-amber-500">
            {posts.filter(p => !p.isPublished).length}
          </p>
        </button>

        <button
          onClick={() => setView("products")}
          className={`group bg-white dark:bg-gray-800 rounded-xl p-5 text-left border transition-all ${
            view === "products"
              ? "border-purple-500 ring-1 ring-purple-500 shadow-md"
              : "border-transparent shadow-sm hover:border-purple-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Produits à rédiger
            </p>
            <Sparkles
              className={`w-4 h-4 ${view === "products" ? "text-purple-500" : "text-purple-500/70"}`}
            />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {products.length}
          </p>
        </button>
      </div>

      {view === "products" ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Produits sans article
            </h2>
            <span className="text-muted-foreground text-sm">
              {products.length} produits trouvés
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">
                Tous vos produits ont un article de blog ! 🎉
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map(product => (
                <div
                  key={product.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                    {product.images[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <span className="text-4xl">📷</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <Button
                        onClick={() => handleGenerateSingle(product)}
                        disabled={generatingId === product.id}
                        className="w-full bg-white text-black hover:bg-gray-100"
                      >
                        {generatingId === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
                        )}
                        Générer l&apos;article
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-semibold truncate mb-1"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {product.reference}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-border shadow-sm overflow-hidden relative">
          {selectedPostIds.length > 0 && (
            <div className="absolute inset-x-0 top-0 z-20 bg-primary/5 p-2 flex items-center justify-between border-b border-primary/20 backdrop-blur-sm animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4 px-4">
                <span className="text-sm font-medium text-primary">
                  {selectedPostIds.length} sélectionné(s)
                </span>
                <div className="h-4 w-px bg-primary/20" />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-primary/20 hover:bg-primary/10 text-primary"
                    onClick={() => handleBulkPostAction("publish")}
                  >
                    <Eye className="w-3.5 h-3.5 mr-2" />
                    Publier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-primary/20 hover:bg-primary/10 text-primary"
                    onClick={() => handleBulkPostAction("unpublish")}
                  >
                    <EyeOff className="w-3.5 h-3.5 mr-2" />
                    Dépublier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-red-200 hover:bg-red-50 text-red-600 hover:border-red-300 dark:border-red-900/30 dark:hover:bg-red-950/30"
                    onClick={() => handleBulkPostAction("delete")}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setSelectedPostIds([])}
              >
                ×
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-border bg-gray-50/50 dark:bg-gray-900/50 gap-4 transition-all pt-12 sm:pt-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Liste des articles
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white dark:bg-gray-800"
                />
              </div>
              <Button
                onClick={() => setShowGenerateModal(true)}
                className="gap-2 shadow-sm whitespace-nowrap"
                size="sm"
                disabled={products.length === 0}
              >
                <Sparkles className="w-4 h-4" />
                Générer (Masse)
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedPostIds.length === filteredPosts.length &&
                      filteredPosts.length > 0
                    }
                    onCheckedChange={toggleSelectAllPosts}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[400px]">Article</TableHead>
                <TableHead>Produit associé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Vues</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-20" />
                    <p className="text-muted-foreground">Chargement...</p>
                  </TableCell>
                </TableRow>
              ) : filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-64 text-center text-muted-foreground"
                  >
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-lg font-medium">Aucun article trouvé</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPosts.map(post => (
                  <TableRow
                    key={post.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedPostIds.includes(post.id)}
                        onCheckedChange={() => toggleSelectPost(post.id)}
                        aria-label={`Select ${post.title}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md space-y-1">
                        <p className="font-semibold truncate group-hover:text-primary transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate bg-muted inline-block px-1.5 py-0.5 rounded">
                          /{post.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                          {post.product.images[0]?.url ? (
                            <Image
                              src={post.product.images[0].url}
                              alt=""
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-4 h-4 mx-auto mt-3 opacity-20" />
                          )}
                        </div>
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {post.product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={post.isPublished ? "default" : "secondary"}
                        className={
                          post.isPublished
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }
                      >
                        {post.isPublished ? "Publié" : "Brouillon"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        {post.viewCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(post)}
                        >
                          {post.isPublished ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRegenerate(post.id)}
                          disabled={generatingId === post.id}
                        >
                          {generatingId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/blog/${post.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                        {post.isPublished && (
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-red-500"
                          onClick={() => setDeleteId(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredPosts.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-border bg-gray-50/50 dark:bg-gray-900/50 text-sm italic opacity-80">
              <p>
                {filteredPosts.length} articles trouvés (Page {currentPage}/
                {totalPages})
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(p => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog
        open={showGenerateModal}
        onOpenChange={(open: boolean) => {
          setShowGenerateModal(open);
          if (!open) setSelectedProducts([]);
        }}
      >
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Génération d&apos;articles IA
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-[500px] gap-4 py-4 uppercase">
            <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="border-none bg-transparent"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => toggleProductSelection(product.id)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${selectedProducts.includes(product.id) ? "bg-primary/5 border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"}`}
                >
                  <Checkbox checked={selectedProducts.includes(product.id)} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.reference}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateModal(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleBulkGenerate}
              disabled={generating || selectedProducts.length === 0}
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Générer{" "}
              {selectedProducts.length > 0 && `(${selectedProducts.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
