"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function StoreFooter() {
  return (
    <footer className="bg-[#1a1a2e] text-white py-16 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold mb-6">Meher</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Nous distribuons nos collections dans des boutiques sélectionnées.
            </p>
            <div className="text-gray-400 text-xs">
              <p>Technology Park</p>
              <p>8-14 Marie Curie Street</p>
              <p>08042 Barcelona</p>
              <p className="mt-2">hello@meher.com</p>
            </div>
          </div>

          {}
          <div>
            <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-gray-300">
              Service Client
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Mes Commandes
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Retours
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Livraison et Retours
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Conditions Générales
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-gray-300">
              Produits
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Chaussures
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Vêtements
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Accessoires
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Bijoux
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Hommes
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Femmes
                </Link>
              </li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-gray-300">
              Infos Entreprise
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  À Propos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Nos Magasins
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Rejoignez-nous
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Nos Valeurs
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            Copyright © 2026 Meher. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-gray-500 hover:text-white">
              <Facebook className="w-4 h-4" />
            </Link>
            <Link href="#" className="text-gray-500 hover:text-white">
              <Instagram className="w-4 h-4" />
            </Link>
            <Link href="#" className="text-gray-500 hover:text-white">
              <Linkedin className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="#" className="hover:text-white">
              Confidentialité
            </Link>
            <Link href="#" className="hover:text-white">
              Sécurité
            </Link>
            <Link href="#" className="hover:text-white">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
