"use client";

import Link from "next/link";
import { Search, MapPin, ShoppingBag, Menu, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import anime from "animejs";
import CartSidebar from "./CartSidebar";
import SearchCommand from "@/components/store/SearchCommand";
import { useCartStore } from "@/lib/cart-store";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export default function StoreNavbar({
  categories = [],
}: {
  categories?: any[];
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Cart Store
  const isCartOpen = useCartStore(state => state.isOpen);
  const setOpen = useCartStore(state => state.setOpen);
  const itemCount = useCartStore(state => state.getItemCount());

  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Animation Effect
  useEffect(() => {
    anime({
      targets: [".nav-logo", ".nav-menu", ".nav-actions"],
      translateY: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: "easeOutQuad",
      duration: 800,
    });
  }, []);

  // Example categories for dropdown
  const collections = [
    { title: "Nouveautés", href: "/shop" },
    { title: "Meilleures Ventes", href: "/shop?sort=best-selling" },
    { title: "Écologique", href: "/shop?category=eco" },
    { title: "Accessoires", href: "/shop?category=accessories" },
  ];

  return (
    <>
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="nav-logo opacity-0 text-2xl font-bold tracking-tight flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-mono text-xl">
              M
            </div>
            Meher
          </Link>

          {/* Desktop Navigation (Shadcn Navigation Menu) */}
          <div className="hidden md:block nav-menu opacity-0">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/" className={navigationMenuTriggerStyle()}>
                      Accueil
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Boutique</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Collection Vedette
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Découvrez nos produits en cuir écologiques.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {categories.length > 0
                        ? categories.map((cat: any) => (
                            <li key={cat.id}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={`/shop?category=${cat.id}`}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    "text-sm font-medium",
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {cat.name}
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))
                        : collections.map(component => (
                            <li key={component.title}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={component.href}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    "text-sm font-medium",
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {component.title}
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/shop?sort=promo"
                      className={navigationMenuTriggerStyle()}
                    >
                      Promotions
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/store/about"
                      className={navigationMenuTriggerStyle()}
                    >
                      À Propos
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/store/blog"
                      className={navigationMenuTriggerStyle()}
                    >
                      Blog
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4 nav-actions opacity-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-500 px-4 py-2 rounded-full transition-colors group"
            >
              <Search className="w-4 h-4 group-hover:text-black" />
              <span className="text-sm">Rechercher...</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <Link
              href="/login"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
              title="Compte"
            >
              <User className="w-5 h-5 text-gray-700 group-hover:text-black transition-colors" />
            </Link>

            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              onClick={() => setOpen(true)}
            >
              <ShoppingBag className="w-5 h-5 text-gray-700 hover:text-black transition-colors" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 text-[10px] flex items-center justify-center bg-black text-white rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-10">
            <Link href="/" className="font-medium hover:text-gray-600">
              Accueil
            </Link>
            <Link href="/shop" className="font-medium hover:text-gray-600">
              Boutique
            </Link>
            <Link
              href="/shop?sort=promo"
              className="font-medium hover:text-gray-600"
            >
              Promotions
            </Link>
            <Link
              href="/store/about"
              className="font-medium hover:text-gray-600"
            >
              À Propos
            </Link>
            {/* Added Search Trigger for Mobile */}
            <button
              className="flex items-center gap-2 font-medium text-left"
              onClick={() => {
                setIsSearchOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <Search className="w-5 h-5" />
              Rechercher
            </button>
            <div className="h-px bg-gray-100 my-2"></div>
            <button
              className="flex items-center gap-2 font-medium"
              onClick={() => setOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              Panier ({itemCount})
            </button>
            <Link
              href="/login"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
              title="Account"
            >
              <User className="w-5 h-5 text-gray-700 group-hover:text-black transition-colors" />
            </Link>
          </div>
        )}
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setOpen(false)} />

      {/* Search Command Palette */}
      <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
