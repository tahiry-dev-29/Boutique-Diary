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
import { AVAILABLE_COLORS, AVAILABLE_SIZES, COLOR_MAP } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DashboardStats } from "./DashboardStats"; // Added import

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

  const [visibleColumns, setVisibleColumns] = useState({
    product: true,
    category: true,
    status: true,
    price: true,
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
      {/* Stats Section - Passed dynamic products data */}
      <DashboardStats products={products} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {/* Search */}
          <div className="relative min-w-[200px] max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <Input
               placeholder="Rechercher..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 h-11 border-gray-100 bg-white shadow-[0_2px_5px_-1px_rgba(0,0,0,0.05)] rounded-full w-full focus:ring-0 focus:border-gray-200"
             />
          </div>

          {/* Status Filter */}
          <div className="w-[150px]">
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="h-11 border-none shadow-[0_2px_5px_-1px_rgba(0,0,0,0.05)] rounded-xl bg-white text-gray-600 hover:bg-gray-50 transition-colors px-4">
                   <div className="flex items-center gap-2">
                       <span className="text-gray-400 font-light">×</span>
                       <span className="font-medium">Statut</span>
                   </div>
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">Tous les status</SelectItem>
                   <SelectItem value="in-stock">En stock</SelectItem>
                   <SelectItem value="out-of-stock">Rupture</SelectItem>
                </SelectContent>
              </Select>
          </div>

          {/* Category Filter */}
          <div className="w-[160px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-11 border-none shadow-[0_2px_5px_-1px_rgba(0,0,0,0.05)] rounded-xl bg-white text-gray-600 hover:bg-gray-50 transition-colors px-4">
                   <div className="flex items-center gap-2">
                       <span className="text-gray-400 font-light">×</span>
                       <span className="truncate font-medium">{selectedCategory === 'all' ? 'Catégorie' : selectedCategory}</span>
                   </div>
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">Toutes</SelectItem>
                   {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
          </div>

           {/* Price Range */}
           <div className="w-[170px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between h-11 border-none shadow-[0_2px_5px_-1px_rgba(0,0,0,0.05)] bg-white rounded-xl text-gray-600 font-medium hover:bg-gray-50">
                        <span className="truncate">
                          {(minPrice || maxPrice) ? `${minPrice || '0'} - ${maxPrice || '∞'}` : 'Prix'}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                     <div className="flex gap-2 items-center">
                        <div className="grid gap-2 flex-1">
                           <Label htmlFor="minPrice">Min</Label>
                           <Input 
                              id="minPrice"
                              type="number" 
                              placeholder="Min" 
                              value={minPrice} 
                              onChange={(e) => setMinPrice(e.target.value)} 
                           />
                        </div>
                        <span className="pt-6">-</span>
                        <div className="grid gap-2 flex-1">
                           <Label htmlFor="maxPrice">Max</Label>
                           <Input 
                              id="maxPrice"
                              type="number" 
                              placeholder="Max" 
                              value={maxPrice} 
                              onChange={(e) => setMaxPrice(e.target.value)} 
                           />
                        </div>
                     </div>
                  </PopoverContent>
                </Popover>
           </div>
        </div>

        <div className="flex items-center gap-2">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button
                   variant="outline"
                   className="h-11 border-none shadow-[0_2px_5px_-1px_rgba(0,0,0,0.05)] bg-white text-gray-700 gap-2 rounded-xl font-semibold hover:bg-gray-50"
                 >
                   <span>Colonnes</span>
                   <Settings2 className="h-4 w-4" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.product}
                    onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, product: checked }))}
                  >
                    Produit
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.category}
                    onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, category: checked }))}
                  >
                    Catégorie
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.status}
                    onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, status: checked }))}
                  >
                    Statut
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.price}
                    onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, price: checked }))}
                  >
                    Prix
                  </DropdownMenuCheckboxItem>
               </DropdownMenuContent>
             </DropdownMenu>
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/30">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="w-12 text-center pl-4">
                  <Checkbox
                    checked={
                      selectedRows.length === currentProducts.length &&
                      currentProducts.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                    className="rounded-md border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                {visibleColumns.product && (
                  <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                    Produit
                  </TableHead>
                )}
                {visibleColumns.category && (
                  <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                    Catégorie
                  </TableHead>
                )}
                {visibleColumns.status && (
                  <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                    Statut
                  </TableHead>
                )}
                {visibleColumns.price && (
                  <TableHead className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-4">
                    Prix
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="space-y-2">
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
                        className={`group transition-all border-b border-gray-50 hover:bg-gray-50/50 ${isExpanded ? "bg-gray-50" : "bg-white"} h-20 cursor-pointer`}
                        onClick={() => setExpandedProductId(isExpanded ? null : (product.id as number))}
                      >
                        <TableCell
                          className="text-center pl-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleSelectRow(product.id as number)
                            }
                            className="rounded-md border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
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
                        {visibleColumns.product && (
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
                        )}
                        {visibleColumns.category && (
                          <TableCell>
                            {product.category ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {product.category.name}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs italic">
                                Sans catégorie
                              </span>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                             {totalStock > 0 ? (
                                 <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                                    En stock
                                 </div>
                             ) : (
                                 <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                                    Rupture
                                 </div>
                             )}
                          </TableCell>
                        )}
                        {visibleColumns.price && (
                          <TableCell className="font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </TableCell>
                        )}
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
                                              background: COLOR_MAP[imgData.color || ''] || imgData.color?.toLowerCase() || 'gray'
                                            }}
                                            title={imgData.color || ''}
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
