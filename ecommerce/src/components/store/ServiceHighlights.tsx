"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import anime from "animejs";

export default function ServiceHighlights() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            anime({
              targets: entry.target.querySelectorAll(".service-card"),
              scale: [0.9, 1],
              opacity: [0, 1],
              delay: anime.stagger(100),
              easing: "easeOutElastic(1, .8)",
              duration: 1000,
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-8 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {}
        <div className="service-card opacity-0 bg-[#faf7f2] p-6 rounded-3xl h-[200px] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-bold text-lg mb-2">
              Produits
              <br />
              100% Authentiques
            </h3>
            <p className="text-[10px] text-gray-500 leading-tight">
              Nous garantissons l'authenticité de tous nos produits.
            </p>
          </div>
          <button className="self-start flex items-center gap-2 border border-black/10 rounded-full pl-3 pr-2 py-1 text-[10px] font-bold hover:bg-white transition-colors">
            Voir Plus <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {}
        <div className="service-card opacity-0 bg-[#f4f7fa] p-6 rounded-3xl h-[200px] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-bold text-lg mb-2">
              Retours
              <br />
              Faciles & Gratuits
            </h3>
            <p className="text-[10px] text-gray-500 leading-tight">
              Processus de retour simple et préparé pour une expérience sans
              tracas.
            </p>
          </div>
          <button className="self-start flex items-center gap-2 border border-black/10 rounded-full pl-3 pr-2 py-1 text-[10px] font-bold hover:bg-white transition-colors">
            Voir Plus <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {}
        <div className="service-card opacity-0 bg-[#f2fcf4] p-6 rounded-3xl h-[200px] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-bold text-lg mb-2">Paiements Sécurisés</h3>
            <p className="text-[10px] text-gray-500 leading-tight">
              Détection de fraude et sécurisation des transactions pour votre
              sérénité.
            </p>
          </div>
          <button className="self-start flex items-center gap-2 border border-black/10 rounded-full pl-3 pr-2 py-1 text-[10px] font-bold hover:bg-white transition-colors">
            Voir Plus <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {}
        <div className="service-card opacity-0 bg-[#6ec1e4] p-6 rounded-3xl h-[200px] relative overflow-hidden flex items-center hover:shadow-md transition-shadow">
          <h3 className="relative z-10 text-white font-bold text-xl">
            Vêtements
            <br />
            d'Été
          </h3>
          {}
          <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-orange-500 rounded-full blur-xl opacity-80"></div>
          <div className="absolute top-10 right-4 text-orange-500 font-black text-4xl rotate-12 z-10">
            20%
            <br />
            <span className="text-sm">OFF</span>
          </div>
        </div>
      </div>
    </section>
  );
}
