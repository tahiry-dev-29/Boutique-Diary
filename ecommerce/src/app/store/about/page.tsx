"use client";

import StoreFooter from "@/components/store/StoreFooter";
import { useEffect, useRef } from "react";
import anime from "animejs";
import { Globe2, Heart, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    anime({
      targets: ".about-hero-text",
      translateY: [30, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: "easeOutExpo",
      duration: 1200,
    });

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            anime({
              targets: entry.target.querySelectorAll(".anim-item"),
              translateY: [50, 0],
              opacity: [0, 1],
              delay: anime.stagger(150),
              easing: "easeOutQuad",
              duration: 800,
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".anim-section").forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background" ref={containerRef}>
      {}
      <section className="relative pt-20 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {}
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <span className="about-hero-text opacity-0 block text-sm font-bold tracking-widest text-[#6ec1e4] uppercase mb-4">
            Notre Histoire
          </span>
          <h1 className="about-hero-text opacity-0 text-5xl md:text-7xl font-bold mb-6 text-gray-900 tracking-tight">
            Redéfinir <br className="md:hidden" /> l&apos;Excellence.
          </h1>
          <p className="about-hero-text opacity-0 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Diary Boutique est née d&apos;une vision simple : créer des produits
            qui inspirent, respectent la planète et élèvent votre quotidien par
            leur qualité exceptionnelle.
          </p>
        </div>
      </section>

      {}
      <section className="py-20 px-6 bg-gray-50 anim-section">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="anim-item opacity-0 relative aspect-square md:aspect-4/5 rounded-[40px] overflow-hidden shadow-2xl">
            {}
            <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-400 relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold opacity-30 text-4xl">
                MISSION
              </div>
            </div>
          </div>
          <div className="anim-item opacity-0">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Une Mission <br /> <span className="text-blue-600">Durable</span>
            </h2>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                Chez Diary Boutique, nous croyons que la mode et le luxe ne
                doivent pas se faire au détriment de notre environnement.
                C&apos;est pourquoi nous nous engageons à utiliser des matériaux
                sourcés de manière éthique.
              </p>
              <p>
                Notre processus de fabrication allie artisanat traditionnel et
                innovation technologique pour minimiser les déchets tout en
                maximisant la durabilité.
              </p>
              <ul className="space-y-4 mt-8">
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-800">
                    Matériaux Éco-responsables
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-800">
                    Qualité Certifiée
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-800">
                    Fabriqué avec Amour
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-6 anim-section">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "10k+", label: "Clients Heureux" },
            { number: "500+", label: "Produits Uniques" },
            { number: "100%", label: "Satisfaction" },
            { number: "24/7", label: "Support Client" },
          ].map((stat, i) => (
            <div
              key={i}
              className="anim-item opacity-0 text-center p-8 rounded-3xl bg-white border border-gray-100 hover:shadow-xl transition-shadow cursor-default"
            >
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {}
      <section className="py-24 px-6 bg-black text-white text-center anim-section">
        <div className="max-w-[800px] mx-auto anim-item opacity-0">
          <div className="text-6xl text-gray-700 font-serif mb-6">“</div>
          <p className="text-2xl md:text-4xl font-medium leading-relaxed mb-8">
            Le véritable luxe réside dans l&apos;harmonie entre ce que nous
            créons et le monde qui nous entoure.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
            <div className="text-left">
              <div className="font-bold text-lg">Diary R.</div>
              <div className="text-gray-400 text-sm">
                Fondateur, Diary Boutique
              </div>
            </div>
          </div>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}
