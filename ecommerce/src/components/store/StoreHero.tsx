"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function StoreHero() {
  return (
    <section className="bg-[#f8f9fa] py-8 md:py-16 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_450px] gap-8 items-start">
        {}
        <div className="bg-transparent rounded-3xl p-4 md:p-8 flex items-center justify-center relative min-h-[400px] md:min-h-[600px]">
          {}
          <div className="relative w-full h-full min-h-[400px]">
            {}
            <div className="absolute inset-0 bg-gray-200 rounded-3xl animate-pulse flex items-center justify-center text-gray-400">
              [Boa Fleece Jacket Image]
            </div>
          </div>
        </div>

        {}
        <div className="flex flex-col gap-6 pt-4">
          <div>
            <span className="text-sm text-gray-500 mb-2 block">
              Jolt / Jackets
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-black mb-4">
              Boa Fleece Jacket
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-gray-400 line-through text-lg">
                $129.00
              </span>
              <span className="text-3xl font-bold text-black">$122.00</span>
              <span className="bg-black text-white text-xs px-2 py-1 rounded">
                5% Disc
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <div className="flex text-black">★★★★☆</div>
              <span>(4.9) 1.2K Reviews</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              Introducing the Boa Fleece Winter Jacket, designed to keep you
              warm and comfortable during the coldest winter days. Crafted from
              high-quality fleece material, this jacket offers superior
              insulation...
            </p>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Available Color</h3>
              <div className="flex gap-3">
                <button className="w-8 h-8 rounded-full bg-black border-2 border-transparent hover:scale-110 transition-transform ring-2 ring-offset-2 ring-black"></button>
                <button className="w-8 h-8 rounded-full bg-blue-700 border-2 border-transparent hover:scale-110 transition-transform"></button>
                <button className="w-8 h-8 rounded-full bg-green-800 border-2 border-transparent hover:scale-110 transition-transform"></button>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-3">Size</h3>
              <div className="flex gap-3">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all
                      ${size === "M" ? "border-black bg-black text-white shadow-lg" : "border-gray-200 text-gray-600 hover:border-black"}
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-4 rounded-full border border-gray-200 font-medium hover:bg-gray-50 transition-colors">
                Add to Chart
              </button>
              <button className="flex-1 py-4 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-colors shadow-lg">
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
