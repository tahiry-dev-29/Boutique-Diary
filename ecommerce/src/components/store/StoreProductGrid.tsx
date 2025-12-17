"use client";

import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  price: number;
  category?: { name: string } | null;
  rating?: number | null;
  images: { url: string }[];
}

interface StoreProductGridProps {
  products?: Product[];
}

export default function StoreProductGrid({
  products = [],
}: StoreProductGridProps) {
  const categories = ["Shoes", "Clothing", "Accessories", "Jewellery"];

  // Use passed products or empty
  const displayProducts = products;

  // Helper to get random pastel color since we might not have it in DB mainly
  const colors = [
    "bg-[#e0e0e0]",
    "bg-[#f5f5f5]",
    "bg-[#f0f0f0]",
    "bg-[#f8f8f8]",
    "bg-[#fff8e1]",
    "bg-[#f0f4f8]",
  ];

  return (
    <section className="py-16 px-4 md:px-6 bg-white">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-3xl font-bold mb-2">Our All Products</h2>
        <p className="text-sm text-gray-500 mb-6">
          These products can rotate weekly or seasons seasonally excitement.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              className="px-6 py-2 rounded-full border border-gray-200 text-sm md:text-xs text-gray-600 hover:border-black hover:text-black transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {displayProducts.length === 0 ? (
          <p className="text-gray-500 italic">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                id={product.id.toString()}
                title={product.name}
                price={product.price}
                category={product.category?.name}
                image={product.images[0]?.url}
                imageColor={colors[index % colors.length]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
