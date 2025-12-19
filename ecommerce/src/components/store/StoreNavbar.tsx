"use client";

import SearchCommand from "@/components/store/SearchCommand";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import anime from "animejs";
import {
  Menu,
  Package2,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Trophy,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";
import CartSidebar from "./CartSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Settings as SettingsIcon,
  UserCircle,
  Heart,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

export default function StoreNavbar({
  categories = [],
}: {
  categories?: any[];
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Auth check failed", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast.success("Déconnexion réussie");
      window.location.reload();
    } catch (err) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  
  const isCartOpen = useCartStore(state => state.isOpen);
  const setOpen = useCartStore(state => state.setOpen);
  const itemCount = useCartStore(state => state.getItemCount());

  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  
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

  
  const collections = [
    {
      title: "Nouveautés",
      href: "/nouveautes",
      icon: Sparkles,
      color: "text-blue-500",
    },
    {
      title: "Top Vente",
      href: "/top-vente",
      icon: Trophy,
      color: "text-amber-500",
    },
    {
      title: "Toute la Boutique",
      href: "/produits",
      icon: Package2,
      color: "text-gray-900",
    },
    {
      title: "Promotions",
      href: "/promotions",
      icon: Tag,
      color: "text-rose-500",
    },
  ];

  const categoriesList = [
    { name: "Hommes", href: "/shop?category=men" },
    { name: "Femmes", href: "/shop?category=women" },
    { name: "Enfants", href: "/shop?category=kids" },
    { name: "Accessoires", href: "/shop?category=accessories" },
  ];

  const pillTriggerStyle = cn(
    "group inline-flex h-9 w-max items-center justify-center !rounded-full bg-transparent px-4 py-2 text-sm font-bold transition-all hover:bg-gray-100 outline-none",
    "text-gray-600 hover:text-black tracking-tight",
  );

  return (
    <>
      <nav className="bg-white/20 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          {}
          <Link
            href="/"
            className="nav-logo opacity-0 flex items-center justify-center transition-transform hover:scale-105"
          >
            <BrandLogo className="w-28 md:w-36" variant="light" />
          </Link>

          {}
          <div className="hidden md:block nav-menu opacity-0 absolute left-1/2 -translate-x-1/2">
            <div className="rounded-full bg-gray-100/50 border border-gray-200/50 p-1 flex items-center gap-1 shadow-sm">
              <NavigationMenu>
                <NavigationMenuList className="gap-0">
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className="!rounded-full transition-none"
                    >
                      <Link
                        href="/"
                        className={cn(
                          pillTriggerStyle,
                          isActive("/") && "bg-white text-black shadow-sm",
                        )}
                      >
                        Accueil
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        pillTriggerStyle,
                        pathname.startsWith("/shop") &&
                          "bg-white text-black shadow-sm",
                      )}
                    >
                      Boutique
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-6 p-8 md:w-[600px] lg:w-[750px] lg:grid-cols-[280px_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              className="flex h-full w-full select-none flex-col justify-end rounded-[32px] bg-gray-50 p-8 no-underline outline-none focus:shadow-md border border-gray-100 transition-all hover:bg-gray-100 animate-in fade-in zoom-in-95 duration-500"
                              href="/produits"
                            >
                              <div className="mb-4 text-2xl font-black tracking-tighter uppercase leading-tight text-gray-900">
                                Catalogue <br /> Complet
                              </div>
                              <p className="text-sm leading-relaxed text-gray-500 font-medium">
                                Explorez l'intégralité de nos collections
                                écologiques et durables.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>

                        <div className="grid grid-cols-2 gap-4">
                          {collections.map(item => (
                            <li key={item.title}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={item.href}
                                  className={cn(
                                    "group/item block select-none space-y-2 rounded-[24px] p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-100",
                                  )}
                                >
                                  {item.icon && (
                                    <div
                                      className={cn(
                                        "p-2 w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-1 group-hover/item:scale-110 transition-transform duration-300",
                                        item.color,
                                      )}
                                    >
                                      <item.icon className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div className="text-[15px] font-bold leading-none text-gray-900">
                                    {item.title}
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </div>

                        <div className="col-span-1 lg:col-start-2 pt-4 mt-2 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            {categoriesList.map(item => (
                              <li key={item.name} className="list-none">
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={item.href}
                                    className="text-sm font-semibold text-gray-500 hover:text-black transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
                                  >
                                    {item.name}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </div>
                        </div>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className="!rounded-full transition-none"
                    >
                      <Link
                        href="/promotions"
                        className={cn(
                          pillTriggerStyle,
                          isActive("/promotions") &&
                            "bg-white text-black shadow-sm",
                        )}
                      >
                        Promotions
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className="!rounded-full transition-none"
                    >
                      <Link
                        href="/produits"
                        className={cn(
                          pillTriggerStyle,
                          isActive("/produits") &&
                            "bg-white text-black shadow-sm",
                        )}
                      >
                        Produits
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className="!rounded-full transition-none"
                    >
                      <Link
                        href="/store/blog"
                        className={cn(
                          pillTriggerStyle,
                          isActive("/store/blog") &&
                            "bg-white text-black shadow-sm",
                        )}
                      >
                        Blog
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {}
          <div className="hidden md:flex items-center gap-3 nav-actions opacity-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-colors group cursor-pointer"
              title="Rechercher"
            >
              <Search className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors" />
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition-all border border-transparent hover:border-gray-200">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.photo} alt={user.username} />
                      <AvatarFallback className="bg-black text-white text-[10px]">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl p-2 mr-4 mt-2 shadow-2xl border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                  <DropdownMenuLabel className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-black text-gray-900 leading-none">
                        {user.username}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100 mx-2" />
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl px-4 py-2.5 focus:bg-gray-50 cursor-pointer group"
                  >
                    <Link href="/customer" className="flex items-center gap-3">
                      <UserCircle className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                      <span className="text-sm font-bold text-gray-700">
                        Mon Profil
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl px-4 py-2.5 focus:bg-gray-50 cursor-pointer group"
                  >
                    <Link
                      href="/customer/wishlist"
                      className="flex items-center gap-3"
                    >
                      <Heart className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition-colors" />
                      <span className="text-sm font-bold text-gray-700">
                        Mes Favoris
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl px-4 py-2.5 focus:bg-gray-50 cursor-pointer group"
                  >
                    <Link
                      href="/customer/addresses"
                      className="flex items-center gap-3"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                      <span className="text-sm font-bold text-gray-700">
                        Mes Adresses
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role !== "CUSTOMER" && (
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl px-4 py-2.5 focus:bg-gray-50 cursor-pointer group"
                    >
                      <Link href="/admin" className="flex items-center gap-3">
                        <SettingsIcon className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                        <span className="text-sm font-bold text-gray-700">
                          Tableau de bord
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-100 mx-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-2.5 focus:bg-rose-50 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span className="text-sm font-bold text-rose-500">
                        Déconnexion
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors group"
                title="Connexion"
              >
                <User className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors" />
              </Link>
            )}

            <button
              onClick={() => setOpen(true)}
              className="relative p-2.5 bg-zinc-900 hover:bg-black text-white rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl shadow-zinc-200/50 flex items-center justify-center cursor-pointer group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-[10px] font-bold text-white items-center justify-center border-2 border-white">
                    {itemCount}
                  </span>
                </span>
              )}
            </button>
          </div>
          {}
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

        {}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 w-full bg-white border-b border-gray-100 p-8 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-10 rounded-b-[40px] z-50">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-lg font-black tracking-tight text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-2xl transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/produits"
                className="text-lg font-black tracking-tight text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-2xl transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Boutique
              </Link>
              <div className="grid grid-cols-2 gap-2 pl-4">
                {collections.map(item => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black p-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    {item.title}
                  </Link>
                ))}
              </div>
              <Link
                href="/blog"
                className="text-lg font-black tracking-tight text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-2xl transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </div>

            <div className="h-px bg-gray-100 my-2"></div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all"
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Search className="w-5 h-5 text-gray-900" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Rechercher
                </span>
              </button>

              <button
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all relative"
                onClick={() => {
                  setOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-gray-900" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 text-[10px] flex items-center justify-center bg-black text-white rounded-full">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Panier
                </span>
              </button>

              <Link
                href="/login"
                className="col-span-2 flex items-center justify-center gap-2 p-4 bg-black text-white rounded-3xl hover:bg-gray-900 transition-all shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-bold">Mon Compte</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {}
      <CartSidebar isOpen={isCartOpen} onClose={() => setOpen(false)} />

      {}
      <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
