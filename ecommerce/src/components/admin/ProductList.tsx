"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  Edit,
  Search,
  Eye,
  Filter,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Settings2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { AVAILABLE_COLORS, AVAILABLE_SIZES } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(
    null,
  );
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Advanced filters
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [productType, setProductType] = useState({
    isNew: false,
    isPromotion: false,
    isBestSeller: false,
  });

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

  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category?.name)
        .filter((c): c is string => Boolean(c)),
    ),
  ).sort();

  const brands = Array.from(
    new Set(
      products.map((p) => p.brand).filter((b): b is string => Boolean(b)),
    ),
  ).sort();

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchLower) ||
      product.reference.toLowerCase().includes(searchLower);

    const matchesCategory =
      selectedCategory === "all" || product.category?.name === selectedCategory;

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

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const toggleSelectAll = () => {
    if (selectedRows.length === currentProducts.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(
        currentProducts
          .map((p) => p.id)
          .filter((id): id is number => id !== undefined),
      );
    }
  };

  const toggleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-700 gap-2 rounded-lg"
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                {}
                <DropdownMenuLabel>Filtres rapides</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Label className="text-xs text-gray-500 mb-1.5 block">
                    Catégorie
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-2 space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">
                      Disponibilité
                    </Label>
                    <Select
                      value={availability}
                      onValueChange={setAvailability}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="in-stock">En stock</SelectItem>
                        <SelectItem value="out-of-stock">Rupture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">
                      Marque
                    </Label>
                    <Select
                      value={selectedBrand}
                      onValueChange={setSelectedBrand}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {brands.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">
                      Couleur
                    </Label>
                    <Select
                      value={selectedColor}
                      onValueChange={setSelectedColor}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {AVAILABLE_COLORS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">
                      Taille
                    </Label>
                    <Select
                      value={selectedSize}
                      onValueChange={setSelectedSize}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {AVAILABLE_SIZES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-700 gap-2 rounded-lg"
            >
              <Settings2 className="h-4 w-4" />
              Colonnes
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => router.push('/admin/products/new')} className="bg-black text-white hover:bg-gray-800 rounded-lg gap-2">
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={
                      selectedRows.length === currentProducts.length &&
                      currentProducts.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Produit
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Catégorie
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Prix
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Search className="h-8 w-8 mb-2 opacity-20" />
                      <p>Aucun produit trouvé</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentProducts.map((product) => {
                  const totalStock =
                    product.images?.reduce((sum, img) => {
                      const imgStock =
                        typeof img === "string" ? 0 : img.stock || 0;
                      return sum + imgStock;
                    }, 0) || 0;
                  const isSelected = selectedRows.includes(
                    product.id as number,
                  );
                  const isExpanded = expandedProductId === product.id;

                  return (
                    <React.Fragment key={product.id}>
                      <TableRow
                        className={`group transition-all border-b border-gray-50 hover:bg-gray-50/50 ${isSelected ? "bg-blue-50/30" : ""}`}
                        onClick={() => toggleSelectRow(product.id as number)}
                      >
                        <TableCell
                          className="text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleSelectRow(product.id as number)
                            }
                          />
                        </TableCell>
                        <TableCell
                          className="p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedProductId(
                              isExpanded ? null : (product.id as number),
                            );
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                              <img
                                src={
                                  product.images && product.images[0]
                                    ? typeof product.images[0] === "string"
                                      ? product.images[0]
                                      : product.images[0].url
                                    : "/placeholder.png"
                                }
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.reference}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.category ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">
                              Sans catégorie
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`gap-1.5 font-normal ${
                              totalStock > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${totalStock > 0 ? "bg-emerald-600" : "bg-red-600"}`}
                            />
                            {totalStock > 0 ? "En stock" : "Rupture"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <span className="sr-only">Menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onView(product)}>
                                <Eye className="mr-2 h-4 w-4" /> Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(product)}>
                                <Edit className="mr-2 h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                                    Supprimer
                                  </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Confirmer la suppression
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer &quot;
                                      {product.name}&quot; ? Cette action est
                                      irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Annuler
                                    </AlertDialogCancel>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>

                      {}
                      {isExpanded && (
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                          <TableCell colSpan={7} className="p-4 shadow-inner">
                            <div className="grid grid-cols-6 gap-4">
                              {product.images?.map((img, idx) => {
                                const imgData =
                                  typeof img === "string" ? { url: img } : img;
                                return (
                                  <div
                                    key={idx}
                                    className="bg-white p-2 rounded-lg border border-gray-200 text-xs shadow-sm"
                                  >
                                    <div className="aspect-square bg-gray-100 rounded-md mb-2 overflow-hidden">
                                      <img
                                        src={imgData.url}
                                        className="w-full h-full object-cover"
                                        alt=""
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      {imgData.reference && (
                                        <div className="text-gray-500">
                                          Ref:{" "}
                                          <span className="text-gray-900 font-medium">
                                            {imgData.reference}
                                          </span>
                                        </div>
                                      )}
                                      {imgData.color && (
                                        <div className="flex items-center gap-1">
                                          <span
                                            className="w-3 h-3 rounded-full border border-gray-200"
                                            style={{
                                              backgroundColor:
                                                imgData.color === "Noir"
                                                  ? "black"
                                                  : imgData.color === "Blanc"
                                                    ? "white"
                                                    : "gray",
                                            }}
                                          ></span>{" "}
                                          {imgData.color}
                                        </div>
                                      )}
                                      {imgData.stock !== undefined && (
                                        <div>Stock: {imgData.stock}</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {}
        <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50/30">
          <div className="text-sm text-gray-500">
            Affichage de{" "}
            <span className="font-medium text-gray-900">
              {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}
            </span>{" "}
            sur{" "}
            <span className="font-medium text-gray-900">
              {filteredProducts.length}
            </span>{" "}
            produits
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="h-8 text-xs"
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="h-8 text-xs"
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
