"use client";

import { useEffect, useState } from "react";
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
  Filter,
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
  DialogDescription,
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
  name: string;
  reference: string;
  brand: string | null;
  images: { url: string }[];
  blogPost: { id: number } | null;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100&status=PUBLISHED");
      if (res.ok) {
        const data = await res.json();
        const allProducts = Array.isArray(data) ? data : data.products || [];
        const productsWithoutBlog = allProducts.filter(
          (p: Product) => !p.blogPost,
        );
        setProducts(productsWithoutBlog);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchProducts();
  }, []);

  const handleBulkGenerate = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Sélectionnez au moins un produit");
      return;
    }

    setGenerating(true);
    let successCount = 0;
    let failCount = 0;

    // Process sequentially to avoid rate limits and show progress
    for (const productId of selectedProducts) {
      try {
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
        console.error(`Failed to generate for product ${productId}`, error);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} article(s) généré(s) avec succès !`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} échec(s) de génération.`);
    }

    setGenerating(false);
    setShowGenerateModal(false);
    setSelectedProducts([]);
    fetchPosts();
    fetchProducts();
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
    } catch (error) {
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
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredPosts = posts.filter(p => {
    if (statusFilter === "published") return p.isPublished;
    if (statusFilter === "draft") return !p.isPublished;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Header handled by Layout */}

      {/* Stats with Filter Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setStatusFilter("all");
            setCurrentPage(1);
          }}
          className={`group bg-white dark:bg-gray-800 rounded-xl p-5 text-left border transition-all ${statusFilter === "all" ? "border-primary ring-1 ring-primary shadow-md" : "border-transparent shadow-sm hover:border-gray-200 dark:hover:border-gray-700"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Articles
            </p>
            <FileText
              className={`w-4 h-4 ${statusFilter === "all" ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <p className="text-3xl font-bold text-foreground">{posts.length}</p>
        </button>

        <button
          onClick={() => {
            setStatusFilter("published");
            setCurrentPage(1);
          }}
          className={`group bg-white dark:bg-gray-800 rounded-xl p-5 text-left border transition-all ${statusFilter === "published" ? "border-green-500 ring-1 ring-green-500 shadow-md" : "border-transparent shadow-sm hover:border-green-500/30"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Publiés</p>
            <Eye
              className={`w-4 h-4 ${statusFilter === "published" ? "text-green-500" : "text-muted-foreground"}`}
            />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {posts.filter(p => p.isPublished).length}
          </p>
        </button>

        <button
          onClick={() => {
            setStatusFilter("draft");
            setCurrentPage(1);
          }}
          className={`group bg-white dark:bg-gray-800 rounded-xl p-5 text-left border transition-all ${statusFilter === "draft" ? "border-amber-500 ring-1 ring-amber-500 shadow-md" : "border-transparent shadow-sm hover:border-amber-500/30"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Brouillons
            </p>
            <Pencil
              className={`w-4 h-4 ${statusFilter === "draft" ? "text-amber-500" : "text-muted-foreground"}`}
            />
          </div>
          <p className="text-3xl font-bold text-amber-500">
            {posts.filter(p => !p.isPublished).length}
          </p>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-transparent shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Produits sans article
            </p>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {products.length}
          </p>
        </div>
      </div>

      {/* Filter indicator */}
      {statusFilter !== "all" && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg w-fit text-sm">
          <Filter className="w-4 h-4" />
          <span>
            Affichage des articles:{" "}
            <strong>
              {statusFilter === "published" ? "Publiés" : "Brouillons"}
            </strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="h-6 px-2 ml-2"
          >
            Effacer
          </Button>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border bg-gray-50/50 dark:bg-gray-900/50">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Liste des articles
          </h2>
          <Button
            onClick={() => setShowGenerateModal(true)}
            className="gap-2 shadow-sm"
            size="sm"
            disabled={products.length === 0}
          >
            <Sparkles className="w-4 h-4" />
            Générer des articles
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
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
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>Chargement des articles...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <FileText className="w-12 h-12 opacity-20" />
                    <p className="text-lg font-medium">Aucun article trouvé</p>
                    <p className="text-sm">
                      {statusFilter !== "all"
                        ? `Essayez de changer le filtre "${statusFilter === "published" ? "Publiés" : "Brouillons"}"`
                        : "Commencez par générer votre premier article de blog !"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPosts.map(post => (
                <TableRow
                  key={post.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="max-w-md space-y-1">
                      <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
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
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <FileText className="w-4 h-4" />
                          </div>
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
                      className={`${post.isPublished ? "bg-green-500 hover:bg-green-600" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"} transition-colors`}
                    >
                      {post.isPublished ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Publié
                        </div>
                      ) : (
                        "Brouillon"
                      )}
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
                        className="hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleTogglePublish(post)}
                        title={post.isPublished ? "Dépublier" : "Publier"}
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
                        className="hover:bg-primary/10 hover:text-primary"
                        asChild
                      >
                        <Link href={`/admin/blog/${post.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      {post.isPublished && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/10 hover:text-primary"
                          asChild
                        >
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
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

        {/* Pagination Controls */}
        {filteredPosts.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-gray-50/50 dark:bg-gray-900/50">
            <p className="text-sm text-muted-foreground">
              Affichage de{" "}
              <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> à{" "}
              <strong>
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredPosts.length)}
              </strong>{" "}
              sur <strong>{filteredPosts.length}</strong> articles
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
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      className="w-8 h-8"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Generate Modal */}
      <Dialog
        open={showGenerateModal}
        onOpenChange={open => {
          setShowGenerateModal(open);
          if (!open) setSelectedProducts([]);
        }}
      >
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              </div>
              Génération d&apos;articles IA
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Sélectionnez un ou plusieurs produits pour générer automatiquement
              leurs articles de blog.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-[500px] gap-4 py-4">
            {/* Search and Select All */}
            <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-border"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedProducts.length === filteredProducts.length) {
                    setSelectedProducts([]);
                  } else {
                    setSelectedProducts(filteredProducts.map(p => p.id));
                  }
                }}
              >
                {selectedProducts.length === filteredProducts.length &&
                filteredProducts.length > 0
                  ? "Tout désélectionner"
                  : "Tout sélectionner"}
              </Button>
            </div>

            {/* Selection Status */}
            <div className="text-sm font-medium text-muted-foreground px-1">
              {selectedProducts.length} produit(s) sélectionné(s)
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Search className="w-6 h-6 opacity-30" />
                  </div>
                  <p>Aucun produit trouvé</p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => toggleProductSelection(product.id)}
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer border transition-all duration-200 group ${
                      selectedProducts.includes(product.id)
                        ? "bg-primary/5 border-primary/30 ring-1 ring-primary/30"
                        : "bg-white dark:bg-gray-800 border-border hover:border-primary/50 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        selectedProducts.includes(product.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-white dark:bg-gray-900 group-hover:border-primary"
                      }`}
                    >
                      {selectedProducts.includes(product.id) && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                      {product.images[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt=""
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-5 h-5 opacity-20" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${selectedProducts.includes(product.id) ? "text-primary" : "text-foreground"}`}
                      >
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {product.reference || "Sans référence"}
                      </p>
                    </div>

                    {product.brand && (
                      <Badge
                        variant="secondary"
                        className="hidden sm:inline-flex opacity-70"
                      >
                        {product.brand}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 sm:justify-between">
            <div className="hidden sm:flex items-center text-xs text-muted-foreground">
              ⚠️ La génération automatique peut prendre quelques secondes par
              article.
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => setShowGenerateModal(false)}
                disabled={generating}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 sm:flex-none gap-2"
                onClick={handleBulkGenerate}
                disabled={generating || selectedProducts.length === 0}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Génération ({selectedProducts.length} restants)...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Générer{" "}
                    {selectedProducts.length > 0 &&
                      `(${selectedProducts.length})`}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;article sera définitivement
              supprimé. Le produit associé restera intact.
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
