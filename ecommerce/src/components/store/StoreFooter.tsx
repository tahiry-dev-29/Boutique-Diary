"use client";

import Link from "next/link";

export default function StoreFooter() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-400 py-24 px-4 md:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 text-center md:text-left">
          {/* Brand & Address */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-3xl font-black mb-8 text-white tracking-tighter font-sans">
              Diary Boutique
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-[280px]">
              Nous distribuons nos collections dans des boutiques sélectionnées
              à travers le monde.
            </p>
            <div className="text-sm text-gray-500 space-y-2 font-medium">
              <p className="hover:text-gray-300 transition-colors">
                Technology Park
              </p>
              <p className="hover:text-gray-300 transition-colors">
                8-14 Marie Curie Street
              </p>
              <p className="hover:text-gray-300 transition-colors">
                08042 Barcelona
              </p>
              <p className="mt-4 pt-4 border-t border-gray-800 text-primary font-bold">
                diary@boutique.com
              </p>
            </div>
          </div>

          {/* Service Client */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-gray-500">
              Service Client
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { label: "FAQ", href: "#" },
                { label: "Mes Commandes", href: "/dashboard/customer/orders" },
                { label: "Mes Favoris", href: "/dashboard/customer/wishlist" },
                {
                  label: "Mes Adresses",
                  href: "/dashboard/customer/addresses",
                },
                { label: "Retours", href: "#" },
                { label: "Livraison et Retours", href: "#" },
                { label: "Conditions Générales", href: "#" },
                { label: "Politique de Confidentialité", href: "#" },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Produits */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-gray-500">
              Produits
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { label: "Nouveautés", href: "/nouveautes" },
                { label: "Promotions", href: "/promotions" },
                { label: "Top Vente", href: "/top-vente" },
                { label: "Tous les produits", href: "/produits" },
                { label: "Hommes", href: "/shop?category=men" },
                { label: "Femmes", href: "/shop?category=women" },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Infos Entreprise */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-gray-500">
              Société
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { label: "Blog", href: "/blog" },
                { label: "À Propos", href: "#" },
                { label: "Nos Magasins", href: "#" },
                { label: "Rejoignez-nous", href: "#" },
                { label: "Nos Valeurs", href: "#" },
                { label: "Support", href: "#" },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="border-t border-gray-900/50 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <p className="text-gray-500 text-xs font-sans tracking-wide">
            &copy; 2026{" "}
            <span className="text-gray-400 font-bold">DIARY BOUTIQUE</span>.
            Conçu avec excellence.
          </p>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] uppercase tracking-widest font-bold">
            <Link
              href="#"
              className="text-gray-500 hover:text-white transition-colors"
            >
              Confidentialité
            </Link>
            <Link
              href="#"
              className="text-gray-500 hover:text-white transition-colors"
            >
              Sécurité
            </Link>
            <Link
              href="#"
              className="text-gray-500 hover:text-white transition-colors"
            >
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
