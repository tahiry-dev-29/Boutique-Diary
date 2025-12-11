import React from "react";
import { Ticket } from "lucide-react";

const PromoBanner = () => {
  return (
    <div className="bg-[#ffead8] text-[#ea580c] text-xs md:text-sm py-2 px-4 text-center font-medium border-b border-[#fed7aa]">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
        <span>
          Livraison <span className="font-bold">OFFERTE</span> en Mondial Relay
          dès 39€ d&apos;achat pour votre 1ère commande* avec le code
        </span>
        <div className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#ea580c] border-dashed">
          <Ticket size={14} className="fill-[#ea580c]/10" />
          <span className="font-bold font-mono">BIENVENUE25</span>
        </div>
        <span className="hidden md:inline text-[#ea580c]/50">|</span>
        <a href="#" className="underline hover:text-[#c2410c]">
          Détails
        </a>
      </div>
    </div>
  );
};

export default PromoBanner;
