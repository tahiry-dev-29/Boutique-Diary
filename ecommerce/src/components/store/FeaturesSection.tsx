"use client";

import { Plus, Minus } from "lucide-react";
import { useState } from "react";

export default function FeaturesSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const features = [
    {
      title: "Unrivaled Quality",
      content:
        "We pride ourselves on offering products that meet the highest standards of quality.",
    },
    {
      title: "Sustainable Focus",
      content:
        "Our commitment to the environment means eco-friendly processes.",
    },
    {
      title: "Unrivaled Variety",
      content:
        "We believe in offering great value through a diverse range of products.",
    },
    {
      title: "Legacy Of Excellence",
      content: "Years of experience in delivering the best to our customers.",
    },
  ];

  return (
    <section className="py-16 px-4 md:px-6 bg-[#f8f9fa] my-8 rounded-[40px] max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Image */}
        <div className="relative h-[400px] md:h-[500px] rounded-[32px] overflow-hidden">
          <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
            {/* Pseudo-Image */}
            <div className="w-full h-full bg-gradient-to-tr from-pink-200 via-orange-100 to-blue-200"></div>
          </div>
        </div>

        {/* Right Content */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-md">
            We pride ourselves on offering products that meet the highest
            standards of quality. Each item is carefully selected, tested, and
            crafted to ensure durability and customer satisfaction.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="border-b border-gray-200 py-4 cursor-pointer"
                onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
              >
                <div className="flex justify-between items-center group">
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <button className="text-gray-400 group-hover:text-black transition-colors">
                    {openIndex === index ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {openIndex === index && (
                  <div className="mt-3 text-sm text-gray-500 animate-slide-in">
                    {feature.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
