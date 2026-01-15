"use client";

import { FooterConfig, defaultFooterConfig } from "@/lib/theme/theme-config";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

interface FooterPreviewProps {
  config: FooterConfig | null | undefined;
}

export function FooterPreview({ config }: FooterPreviewProps) {
  const cfg = config || defaultFooterConfig;

  return (
    <footer
      className="w-full px-4 py-4"
      style={{
        backgroundColor: cfg.bgColor,
        color: cfg.textColor,
      }}
    >
      <div className="max-w-full mx-auto">
        {/* Columns */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* Brand */}
          <div>
            <h4 className="font-bold text-xs mb-2">Diary Boutique</h4>
            <p className="text-[8px] opacity-60 leading-relaxed">
              Boutique écologique
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h5 className="text-[8px] font-semibold uppercase mb-1 opacity-70">
              Service
            </h5>
            <ul className="space-y-0.5 text-[8px] opacity-60">
              <li>FAQ</li>
              <li>Commandes</li>
              <li>Retours</li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h5 className="text-[8px] font-semibold uppercase mb-1 opacity-70">
              Produits
            </h5>
            <ul className="space-y-0.5 text-[8px] opacity-60">
              <li>Nouveautés</li>
              <li>Promotions</li>
              <li>Top Vente</li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h5 className="text-[8px] font-semibold uppercase mb-1 opacity-70">
              Infos
            </h5>
            <ul className="space-y-0.5 text-[8px] opacity-60">
              <li>Blog</li>
              <li>À Propos</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div
          className="border-t pt-2 flex items-center justify-between"
          style={{ borderColor: `${cfg.textColor}20` }}
        >
          {/* Copyright */}
          <p className="text-[8px] opacity-50">{cfg.copyrightText}</p>

          {/* Social Icons */}
          {cfg.showSocial && (
            <div className="flex items-center gap-2">
              <Facebook className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
              <Instagram className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
              <Linkedin className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
              <Twitter className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
            </div>
          )}
        </div>

        {/* Newsletter indicator */}
        {cfg.showNewsletter && (
          <div
            className="mt-2 pt-2 border-t"
            style={{ borderColor: `${cfg.textColor}10` }}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 h-5 bg-white/10 rounded text-[8px] flex items-center px-2 opacity-50">
                Votre email...
              </div>
              <button className="text-[8px] px-2 py-1 bg-white/20 rounded">
                S&apos;inscrire
              </button>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
