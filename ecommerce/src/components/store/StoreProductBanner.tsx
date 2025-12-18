"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function StoreProductBanner() {
  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden mb-12 group">
      {/* Animated Animated Background - Modern Gradient "Video" Effect */}
      <div className="absolute inset-0 bg-slate-900">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] animate-pulse mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] animate-pulse delay-700 mix-blend-screen" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-rose-500 rounded-full blur-[100px] animate-bounce mix-blend-screen duration-[10000ms]" />
        </div>

        {/* Fine Mesh Pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 px-8 py-20 md:py-28 flex flex-col items-center text-center overflow-hidden">
        {/* Floating Elements Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-in fade-in zoom-in duration-[3000ms] repeat-infinite alternate"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>

        {/* Text Section */}
        <div className="max-w-4xl space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-black uppercase tracking-[0.2em] mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Collection Exclusive 2026</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
            Tous nos{" "}
            <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-indigo-200 bg-clip-text text-transparent">
              Produits
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both">
            Parcourez l'intégralité de notre collection. Des pièces uniques
            conçus avec passion pour sublimer votre quotidien.
          </p>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700 fill-mode-both">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-slate-900 bg-gray-800 flex items-center justify-center overflow-hidden shadow-xl"
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm">
                +2.5k clients satisfaits
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className="w-3 h-3 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/60 to-transparent z-0" />
    </div>
  );
}
