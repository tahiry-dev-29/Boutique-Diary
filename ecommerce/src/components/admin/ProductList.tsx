"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/admin";
import { formatPrice } from "@/lib/formatPrice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Edit, Search, X, Eye, Filter } from "lucide-react";
import { toast } from "sonner";
import { AVAILABLE_COLORS, AVAILABLE_SIZES } from "@/lib/constants";
import { Label } from "@/components/ui/label";

interface ProductListProps {
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  refreshTrigger: number;
}

export default function ProductList({
  onEdit,
  onView,
  refreshTrigger,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Advanced filters
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [availability, setAvailability] = useState("all"); // all, in-stock, out-of-stock
  const [productType, setProductType] = useState({
    isNew: false,
    isPromotion: false,
    isBestSeller: false,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        toast.success("Produit supprimé avec succès");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Get unique categories for filter dropdown
  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category?.name)
        .filter((c): c is string => Boolean(c))
    )
  ).sort();

  // Get unique brands
  const brands = Array.from(
    new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))
  ).sort();

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search term (Name or Reference)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchLower) ||
      product.reference.toLowerCase().includes(searchLower);

    // Category
    const matchesCategory =
      selectedCategory === "all" || product.category?.name === selectedCategory;

    // Price range
    const price = product.price;
    const matchesMinPrice = minPrice === "" || price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === "" || price <= parseFloat(maxPrice);

    // Advanced filters
    const matchesBrand =
      selectedBrand === "all" || product.brand === selectedBrand;
    const matchesColor =
      selectedColor === "all" || product.colors?.includes(selectedColor);
    const matchesSize =
      selectedSize === "all" || product.sizes?.includes(selectedSize);

    // Calculate total stock from images
    const totalStock =
      product.images?.reduce((sum, img) => {
        const imgStock = typeof img === "string" ? 0 : img.stock || 0;
        return sum + imgStock;
      }, 0) || 0;

    const matchesAvailability =
      availability === "all" ||
      (availability === "in-stock" && totalStock > 0) ||
      (availability === "out-of-stock" && totalStock === 0);

    const matchesType =
      (!productType.isNew || product.isNew) &&
      (!productType.isPromotion || product.isPromotion) &&
      (!productType.isBestSeller || product.isBestSeller);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesBrand &&
      matchesColor &&
      matchesSize &&
      matchesAvailability &&
      matchesType
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCategory,
    minPrice,
    maxPrice,
    selectedBrand,
    selectedColor,
    selectedSize,
    availability,
    productType,
  ]);

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-6">
          <h3 className="font-semibold flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </h3>

          <div className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Nom ou référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>Prix (Ar)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label>Marque</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les marques</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Couleur</Label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les couleurs</SelectItem>
                  {AVAILABLE_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label>Taille</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les tailles</SelectItem>
                  {AVAILABLE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label>Disponibilité</Label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les stocks</SelectItem>
                  <SelectItem value="in-stock">En stock</SelectItem>
                  <SelectItem value="out-of-stock">Rupture de stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setMinPrice("");
                setMaxPrice("");
                setSelectedBrand("all");
                setSelectedColor("all");
                setSelectedSize("all");
                setAvailability("all");
                setProductType({
                  isNew: false,
                  isPromotion: false,
                  isBestSeller: false,
                });
              }}
              className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Product Table */}
        <div className="rounded-md border bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-gray-500"
                  >
                    Aucun produit trouvé
                  </TableCell>
                </TableRow>
              ) : (
                currentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-10 w-10 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-gray-400 text-[10px]">
                            No img
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {product.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{product.reference}</TableCell>
                    <TableCell>
                      {product.category ? (
                        <Badge variant="secondary">
                          {product.category.name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 italic text-sm">
                          Non classé
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      {(() => {
                        // Calculate total stock from all images
                        const totalStock =
                          product.images?.reduce((sum, img) => {
                            const imgStock =
                              typeof img === "string" ? 0 : img.stock || 0;
                            return sum + imgStock;
                          }, 0) || 0;
                        return (
                          <Badge
                            variant={totalStock > 0 ? "outline" : "destructive"}
                            className={
                              totalStock > 0
                                ? "bg-green-50 text-green-700 border-green-200"
                                : ""
                            }
                          >
                            {totalStock}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(product)}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Êtes-vous absolument sûr ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action ne peut pas être annulée. Cela
                              supprimera définitivement le produit &quot;
                              {product.name}&quot; de la base de données.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                product.id && handleDelete(product.id)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t rounded-b-md">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{startIndex + 1}</span>{" "}
              à{" "}
              <span className="font-medium">
                {Math.min(endIndex, filteredProducts.length)}
              </span>{" "}
              sur <span className="font-medium">{filteredProducts.length}</span>{" "}
              produits
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 p-0 ${
                        currentPage === page
                          ? "bg-black text-white hover:bg-gray-800"
                          : ""
                      }`}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
