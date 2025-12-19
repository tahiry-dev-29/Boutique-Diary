"use client";

import Image from "next/image";

export default function BestCollectionBanner() {
  return (
    <section className="py-16 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto bg-[#fdfaf6] rounded-[40px] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="p-8 md:p-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              La Meilleure Collection <br />
              de Sacs en Cuir <br />
              Pour Vous
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Pour ceux qui préfèrent une option mains libres, élégante et
              fonctionnelle.
            </p>
            <button className="bg-transparent border border-gray-300 rounded-full px-8 py-3 text-sm font-semibold hover:bg-black hover:text-white transition-colors">
              Acheter Maintenant
            </button>
          </div>

          <div className="relative h-[300px] md:h-[400px] bg-[#eef6fc] flex items-center justify-center rounded-[40px] m-4 md:m-0 md:rounded-l-none md:rounded-r-[40px]">
            {}
            <div className="absolute w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>

            {}
            <div className="relative w-48 h-48 bg-orange-500 rotate-[-12deg] rounded-xl shadow-2xl flex items-center justify-center text-white font-bold">
              [Image Sac]
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
