"use client";

import { Heart } from "lucide-react";

export default function PromoSection() {
  return (
    <section className="py-8 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Yellow - Get up to 5% off */}
        <div className="relative h-[300px] rounded-[32px] overflow-hidden bg-[#e8e458] group">
          <button className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10 hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 text-gray-400" />
          </button>
          <button className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-black z-10 hover:bg-white/50 transition-colors">
            Buy Now
          </button>

          <div className="absolute inset-0 flex items-center justify-center">
            {/* Image placeholder */}
            <div className="w-2/3 h-2/3 bg-black/5 rounded-2xl rotate-[-5deg]"></div>
          </div>

          <div className="absolute bottom-4 left-4 bg-white px-5 py-3 rounded-2xl shadow-sm">
            <p className="font-semibold text-sm">Get up to 5% off</p>
            <p className="text-sm">discounts</p>
          </div>
        </div>

        {/* Card 2: Light Blue/Grey - Soothing Cap */}
        <div className="relative h-[300px] rounded-[32px] overflow-hidden bg-[#f2f0ea] group">
          <button className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10 hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 text-gray-400" />
          </button>
          <button className="absolute top-4 right-4 bg-black/5 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-black z-10 hover:bg-black/10 transition-colors">
            Buy Now
          </button>

          <div className="absolute inset-0 flex items-center justify-center">
            {/* Image placeholder */}
            <div className="w-2/3 h-2/3 bg-blue-100 rounded-full"></div>
          </div>

          <div className="absolute bottom-4 left-4 bg-white px-5 py-3 rounded-2xl shadow-sm">
            <p className="font-semibold text-sm">Soothing Cap</p>
            <p className="text-sm text-gray-500">connected comfort</p>
          </div>
        </div>

        {/* Card 3: Orange - Winx rubber */}
        <div className="relative h-[300px] rounded-[32px] overflow-hidden bg-[#fcb334] group">
          <button className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10 hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 text-gray-400" />
          </button>
          <button className="absolute top-4 right-4 bg-black/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-black z-10 hover:bg-black/20 transition-colors">
            Buy Now
          </button>

          <div className="absolute inset-0 flex items-center justify-center">
            {/* Image placeholder */}
            <div className="w-2/3 h-2/3 bg-orange-200/50 rounded-lg rotate-[10deg]"></div>
          </div>

          <div className="absolute bottom-4 left-4 bg-white px-5 py-3 rounded-2xl shadow-sm">
            <p className="font-semibold text-sm">Winx rubber</p>
            <p className="text-sm text-gray-500">zebra shoes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
