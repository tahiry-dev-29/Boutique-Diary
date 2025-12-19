"use client";

import React, { useEffect, useState } from "react";
import { Heart, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/store/ScrollReveal";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/customer/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">
          Chargement de vos favoris...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Mes Favoris
        </h1>
        <p className="text-muted-foreground mt-1 font-medium">
          Retrouvez ici tous les produits que vous avez aimés
        </p>
      </div>

      {wishlist.length > 0 ? (
        <ScrollReveal
          animation="fade-up"
          stagger={50}
          selector=".product-card-reveal"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map(item => (
              <ProductCard
                key={item.id}
                id={item.product.id.toString()}
                title={item.product.name}
                price={item.product.price}
                oldPrice={item.product.oldPrice}
                image={item.product.images[0]?.url}
                category={item.product.category?.name}
                isNew={item.product.isNew}
                isPromotion={item.product.isPromotion}
                isBestSeller={item.product.isBestSeller}
                rating={item.product.rating}
                reviewCount={item.product.reviewCount}
                initialIsWishlisted={true}
              />
            ))}
          </div>
        </ScrollReveal>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-[32px] border border-dashed border-border">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Votre liste est vide
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xs text-center">
            Explorez notre boutique et cliquez sur le coeur pour ajouter des
            produits à vos favoris.
          </p>
          <Button asChild className="rounded-xl px-8 py-6 font-bold text-lg">
            <Link href="/produits">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Découvrir la boutique
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
