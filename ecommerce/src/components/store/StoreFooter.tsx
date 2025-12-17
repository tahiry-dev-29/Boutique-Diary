"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function StoreFooter() {
  return (
    <footer className="bg-[#1a1a2e] text-white py-16 px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold mb-6">Meher</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              We distribute our collections to seasoned stores.
            </p>
            <div className="text-gray-400 text-xs">
              <p>Technology Park</p>
              <p>8-14 Marie Curie Street</p>
              <p>08042 Barcelona</p>
              <p className="mt-2">hello@meher.com</p>
            </div>
          </div>

          {/* Customer Services */}
          <div>
            <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-gray-300">
              Customer Services
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Store Return
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Shipping and Return
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-gray-300">
              Products
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Shoes
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Clothing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Jewellery
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Women
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-gray-300">
              Company Info
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Our stores
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Work with us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Our values
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Service Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            Copyright © 2026 Meher. All rights reserved.
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
              Privacy
            </Link>
            <Link href="#" className="hover:text-white">
              Security
            </Link>
            <Link href="#" className="hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
