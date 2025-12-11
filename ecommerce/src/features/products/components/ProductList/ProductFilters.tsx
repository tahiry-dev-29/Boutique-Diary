"use client";

import { Product } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Search } from "lucide-react";
import { AVAILABLE_COLORS, AVAILABLE_SIZES } from "@/lib/constants";

export interface ProductFiltersState {
  searchTerm: string;
  selectedCategory: string;
  minPrice: string;
  maxPrice: string;
  selectedBrand: string;
  selectedColor: string;
  selectedSize: string;
  availability: string;
  productType: {
    isNew: boolean;
    isPromotion: boolean;
    isBestSeller: boolean;
  };
}

interface ProductFiltersProps {
  filters: ProductFiltersState;
  onFiltersChange: (filters: ProductFiltersState) => void;
  products: Product[];
}

export function ProductFilters({
  filters,
  onFiltersChange,
  products,
}: ProductFiltersProps) {
  // Get unique categories for filter dropdown
  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category?.name)
        .filter((c): c is string => Boolean(c)),
    ),
  ).sort();

  // Get unique brands
  const brands = Array.from(
    new Set(
      products.map((p) => p.brand).filter((b): b is string => Boolean(b)),
    ),
  ).sort();

  const updateFilter = <K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      searchTerm: "",
      selectedCategory: "all",
      minPrice: "",
      maxPrice: "",
      selectedBrand: "all",
      selectedColor: "all",
      selectedSize: "all",
      availability: "all",
      productType: {
        isNew: false,
        isPromotion: false,
        isBestSeller: false,
      },
    });
  };

  return (
    <div className="w-full md:w-64 shrink-0 space-y-6">
      <div className="bg-background p-4 rounded-lg border shadow-sm space-y-6">
        <h3 className="font-semibold flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </h3>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Recherche</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Nom ou référence..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select
              value={filters.selectedCategory}
              onValueChange={(value) => updateFilter("selectedCategory", value)}
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
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label>Marque</Label>
            <Select
              value={filters.selectedBrand}
              onValueChange={(value) => updateFilter("selectedBrand", value)}
            >
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
            <Select
              value={filters.selectedColor}
              onValueChange={(value) => updateFilter("selectedColor", value)}
            >
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
            <Select
              value={filters.selectedSize}
              onValueChange={(value) => updateFilter("selectedSize", value)}
            >
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
            <Select
              value={filters.availability}
              onValueChange={(value) => updateFilter("availability", value)}
            >
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
            onClick={resetFilters}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
}

export const initialFiltersState: ProductFiltersState = {
  searchTerm: "",
  selectedCategory: "all",
  minPrice: "",
  maxPrice: "",
  selectedBrand: "all",
  selectedColor: "all",
  selectedSize: "all",
  availability: "all",
  productType: {
    isNew: false,
    isPromotion: false,
    isBestSeller: false,
  },
};

export function filterProducts(
  products: Product[],
  filters: ProductFiltersState,
): Product[] {
  return products.filter((product) => {
    // Search term (Name or Reference)
    const searchLower = filters.searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchLower) ||
      product.reference.toLowerCase().includes(searchLower);

    // Category
    const matchesCategory =
      filters.selectedCategory === "all" ||
      product.category?.name === filters.selectedCategory;

    // Price range
    const price = product.price;
    const matchesMinPrice =
      filters.minPrice === "" || price >= parseFloat(filters.minPrice);
    const matchesMaxPrice =
      filters.maxPrice === "" || price <= parseFloat(filters.maxPrice);

    // Advanced filters
    const matchesBrand =
      filters.selectedBrand === "all" ||
      product.brand === filters.selectedBrand;
    const matchesColor =
      filters.selectedColor === "all" ||
      product.colors?.includes(filters.selectedColor);
    const matchesSize =
      filters.selectedSize === "all" ||
      product.sizes?.includes(filters.selectedSize);

    // Calculate total stock from images
    const totalStock =
      product.images?.reduce((sum, img) => {
        const imgStock = typeof img === "string" ? 0 : img.stock || 0;
        return sum + imgStock;
      }, 0) || 0;

    const matchesAvailability =
      filters.availability === "all" ||
      (filters.availability === "in-stock" && totalStock > 0) ||
      (filters.availability === "out-of-stock" && totalStock === 0);

    const matchesType =
      (!filters.productType.isNew || product.isNew) &&
      (!filters.productType.isPromotion || product.isPromotion) &&
      (!filters.productType.isBestSeller || product.isBestSeller);

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
}
