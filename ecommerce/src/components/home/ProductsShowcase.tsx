"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  images: { url: string; color?: string }[];
  isNew: boolean;
  isPromotion: boolean;
  isBestSeller: boolean;
  colors: string[];
}

export default function ProductsShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products?limit=4");
        if (response.ok) {
          const data = await response.json();
          setProducts(data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getBadge = (product: Product) => {
    if (product.isPromotion)
      return { text: "Promotion", color: "bg-[#A07DDF]" };
    if (product.isNew) return { text: "New", color: "bg-[#A07DDF]" };
    if (product.isBestSeller)
      return { text: "Customer favorite", color: "bg-[#A07DDF]" };
    return null;
  };

  const getColorDots = (product: Product) => {
    const defaultColors = ["#4a7c7c", "#6b8b6b", "#c9a28a", "#d4b8a5"];
    return product.colors?.length > 0
      ? product.colors
      : defaultColors.slice(0, 3);
  };

  if (isLoading) {
    return (
      <section className="products-showcase">
        <div className="products-container">
          <div className="products-loading">
            <div className="products-spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="products-showcase">
      <div className="products-container">
        {/* Header */}
        <div className="products-header">
          <div>
            <p className="products-subtitle">Eco Essentials Planet-Friendly</p>
            <h2 className="products-title">
              Bestselling <span className="products-title-icon">✦</span>{" "}
              <strong>Products</strong>
            </h2>
          </div>
          <Link href="/shop" className="products-more-link">
            More products →
          </Link>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {/* Previous Arrow */}
          <button
            className="products-nav products-nav-prev"
            aria-label="Previous"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {products.map((product) => {
            const badge = getBadge(product);
            const colors = getColorDots(product);
            const imageUrl = product.images?.[0]?.url || "/placeholder.png";

            return (
              <div key={product.id} className="product-card">
                {/* Image Container */}
                <div className="product-card-image">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    width={250}
                    height={280}
                    className="product-card-img"
                  />
                  {badge && (
                    <span className={`product-badge ${badge.color}`}>
                      {badge.text}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="product-card-info">
                  {/* Color Dots */}
                  <div className="product-colors">
                    {colors.slice(0, 4).map((color, index) => (
                      <span
                        key={index}
                        className="product-color-dot"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Description */}
                  <p className="product-card-desc">
                    {product.description || product.name}
                  </p>

                  {/* Price and Cart */}
                  <div className="product-card-footer">
                    <span className="product-price">
                      ${product.price.toFixed(2)}
                    </span>
                    <button className="product-cart-btn">+ Cart</button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Next Arrow */}
          <button className="products-nav products-nav-next" aria-label="Next">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
