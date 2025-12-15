import React from "react";
import Link from "next/link";
import { Smartphone } from "lucide-react";

const CategoryNav = () => {
  return (
    <div className="bg-gray-100 border-b border-gray-100 shadow-sm hidden md:block">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between">
        <nav>
          <ul className="flex items-center gap-6 text-[15px] font-medium text-[#5c6e66]">
            <li>
              <Link
                href="#"
                className="hover:text-[#104f32] transition-colors py-4 block"
              >
                Marque Greenweez
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-[#104f32] transition-colors py-4 block"
              >
                Déstockage
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-[#104f32] transition-colors py-4 block"
              >
                Régimes spéciaux
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-[#104f32] transition-colors py-4 block"
              >
                Bébé & Enfant
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-[#104f32] transition-colors py-4 block flex items-center gap-1.5"
              >
                <span className="font-bold text-[#2563eb]">Frais</span>
                <span className="text-[#2563eb] text-xs">❄️</span>
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-[#104f32] transition-colors py-4 block font-bold text-[#b45309]"
              >
                Nouveautés
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-[#104f32] transition-colors py-4 block font-bold text-[#b45309]"
              >
                Noël
              </Link>
            </li>
          </ul>
        </nav>

        <a
          href="#"
          className="bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors ml-4"
        >
          <Smartphone size={16} />
          EXCLU APP : -15%
        </a>
      </div>
    </div>
  );
};

export default CategoryNav;
