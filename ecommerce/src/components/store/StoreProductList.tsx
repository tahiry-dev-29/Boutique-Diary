"use client";

import React, { useState, useMemo } from "react";
import StoreProductGrid from "./StoreProductGrid";
import StoreProductFilters from "./StoreProductFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  images: any[];
  category?: { id: number; name: string } | null;
  [key: string]: any;
}

interface Category {
  id: number;
  name: string;
}

interface StoreProductListProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function StoreProductList({
  initialProducts,
  categories,
}: StoreProductListProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [visibleCount, setVisibleCount] = useState(20);

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return initialProducts;
    return initialProducts.filter((p) => p.categoryId === selectedCategoryId);
  }, [initialProducts, selectedCategoryId]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

  return (
    <div className="space-y-8">
      <StoreProductFilters
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={(id) => {
          setSelectedCategoryId(id);
          setVisibleCount(20);
        }}
      />

      {visibleProducts.length > 0 ? (
        <>
          <StoreProductGrid
            products={visibleProducts}
            showTitle={false}
            showFooter={false}
          />

          {hasMore && (
            <div className="flex justify-center pt-12 pb-8">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="group h-14 px-8 rounded-2xl border-2 border-gray-100 hover:border-black transition-all hover:bg-black hover:text-white"
              >
                <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90 text-black" />
                <span className="text-black uppercase tracking-widest text-xs">
                  Charger plus
                </span>
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-24 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-bold italic">
            Aucun produit trouvé dans cette catégorie.
          </p>
        </div>
      )}
    </div>
  );
}
