"use client";

import { Plus, Minus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import Image from "next/image";

export default function FeaturesSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Animate Image (from left)
            anime({
              targets: entry.target.querySelector(".feature-image"),
              translateX: [-50, 0],
              opacity: [0, 1],
              easing: "easeOutQuad",
              duration: 1000,
            });

            // Animate Content (from right)
            anime({
              targets: entry.target.querySelector(".feature-content"),
              translateX: [50, 0],
              opacity: [0, 1],
              easing: "easeOutQuad",
              duration: 1000,
              delay: 300,
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Qualité Inégalée",
      content:
        "Nous sommes fiers d'offrir des produits qui répondent aux normes de qualité les plus élevées.",
    },
    {
      title: "Approche Durable",
      content:
        "Notre engagement envers l'environnement signifie des processus écologiques.",
    },
    {
      title: "Variété Exceptionnelle",
      content:
        "Nous croyons en l'offre d'une grande valeur à travers une gamme diversifiée de produits.",
    },
    {
      title: "Héritage d'Excellence",
      content: "Des années d'expérience pour offrir le meilleur à nos clients.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-16 px-4 md:px-6 bg-white my-8 rounded-[40px] max-w-[1400px] mx-auto overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Image */}
        <div className="feature-image opacity-0 relative h-[500px] w-full rounded-[32px] overflow-hidden shadow-2xl">
          <Image
            src="/images/why-us-gradient.png"
            alt="Pourquoi Nous Choisir - Gradient Abstract"
            fill
            className="object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="feature-content opacity-0">
          <h2 className="text-4xl font-bold mb-4 tracking-tight text-gray-900">
            Pourquoi Nous Choisir
          </h2>
          <p className="text-base text-gray-500 mb-10 leading-relaxed max-w-lg">
            Nous sommes fiers d'offrir des produits qui répondent aux normes de
            qualité les plus élevées. Chaque article est soigneusement
            sélectionné, testé et conçu pour assurer durabilité et satisfaction
            client.
          </p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-4 cursor-pointer group"
                onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
              >
                <div className="flex justify-between items-center py-2">
                  <h3
                    className={`font-bold text-lg transition-colors ${openIndex === index ? "text-black" : "text-gray-700"}`}
                  >
                    {feature.title}
                  </h3>
                  <button className="text-gray-400 group-hover:text-black transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
                    {openIndex === index ? (
                      <Minus className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {openIndex === index && (
                  <div className="mt-2 text-gray-500 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-300">
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
