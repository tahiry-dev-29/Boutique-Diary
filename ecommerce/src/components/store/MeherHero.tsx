"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function MeherHero() {
  return (
    <section className="pt-12 pb-16 px-4 md:px-6 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto text-center md:text-left relative">
        {/* Review Floating Badge (Top Right of text area) */}
        <div className="hidden md:flex absolute right-0 top-0 flex-col items-end">
          <div className="flex -space-x-3 mb-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative"
              >
                {/* Placeholder for avatars */}
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
              +
            </div>
          </div>
          <div className="text-right">
            <span className="block font-bold text-sm">500+</span>
            <span className="text-xs text-gray-500">Happy Customers</span>
          </div>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-gray-900 leading-[1.1] mb-8">
            Access to high- Quality, <br />
            <span className="font-bold">Eco-Friendly</span> products <br />
            and services
            <span className="inline-flex items-center ml-4 align-middle">
              <ArrowRight className="w-8 h-8 md:w-12 md:h-12 text-gray-400 stroke-[1.5]" />
              <button className="ml-4 bg-[#1a1a2e] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-black transition-colors">
                Contact Us
              </button>
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}
