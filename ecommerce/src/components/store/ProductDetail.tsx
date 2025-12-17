"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useState } from "react";

interface ProductDetailProps {
  product: any; // Ideally stricter type matching prisma return
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState("bg-black");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImage, setSelectedImage] = useState(
    product?.images[0]?.url || null,
  );

  if (!product) {
    return (
      <div className="p-16 text-center text-red-500">Product not found</div>
    );
  }

  // Use real images if available, else placeholders
  const images =
    product.images.length > 0 ? product.images : [{ id: 0, url: null }];
  const mainImage = selectedImage || images[0].url;

  // Mock variations if empty for UI demo
  const colors =
    product.colors && product.colors.length > 0
      ? product.colors
      : ["bg-black", "bg-blue-700"];
  const sizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : ["S", "M", "L", "XL"];

  return (
    <section className="py-8 md:py-16 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_450px] gap-12 items-start">
        {/* Gallery / Main Image */}
        <div className="grid grid-cols-[80px_1fr] gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-4">
            {images.map((img: any, i: number) => (
              <div
                key={i}
                className={`aspect-square bg-gray-100 rounded-lg cursor-pointer hover:ring-2 hover:ring-black transition-all relative overflow-hidden ${mainImage === img.url ? "ring-2 ring-black" : ""}`}
                onClick={() => setSelectedImage(img.url)}
              >
                {img.url && (
                  <Image
                    src={img.url}
                    alt="Thumbnail"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="bg-gray-50 rounded-3xl aspect-square relative flex items-center justify-center overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-gray-400 font-bold text-xl">
                [Main Product Image]
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-sm text-gray-500 block mb-2">
              {product.category?.name || "Uncategorized"}
            </span>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              {product.oldPrice && (
                <span className="text-gray-400 line-through text-lg">
                  ${product.oldPrice.toFixed(2)}
                </span>
              )}
              <span className="text-4xl font-bold">
                ${product.price.toFixed(2)}
              </span>
              {product.isPromotion && (
                <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">
                  Sale
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-black">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < (product.rating || 4) ? "fill-black text-black" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.rating || "4.5"}) {product.reviewCount || 0} Reviews
              </span>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Descriptions</h3>
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">
                {product.description ||
                  "No description available for this product."}
              </p>
              <button className="text-black font-semibold underline text-sm mt-1">
                more
              </button>
            </div>

            {/* Colors - Simulating color selection for now as DB stores strings */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">Available Color</h3>
              <div className="flex gap-3">
                {colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full bg-gray-200 border-2 border-transparent hover:scale-110 transition-transform ${selectedColor === color ? "ring-2 ring-offset-2 ring-black" : ""}`}
                    title={color}
                  >
                    {/* If color starts with #, use style, else class if standard tailwind */}
                  </button>
                ))}
                {/* Temporary Visual Mock for demo if no real colors */}
                {colors.length === 0 && (
                  <>
                    <div className="w-8 h-8 rounded-full bg-black border-2 border-transparent cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-blue-700 border-2 border-transparent cursor-pointer"></div>
                  </>
                )}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <h3 className="font-bold mb-3">Size</h3>
              <div className="flex gap-3">
                {sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all font-medium
                                 ${selectedSize === size ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-black"}
                             `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-4 rounded-full border border-gray-200 font-bold hover:bg-gray-50 transition-colors">
                Add to Chart
              </button>
              <button className="flex-1 py-4 rounded-full bg-black text-white font-bold hover:bg-gray-800 transition-colors shadow-lg">
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
