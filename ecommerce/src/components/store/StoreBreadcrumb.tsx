"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export default function StoreBreadcrumb({
  productName,
}: {
  productName?: string;
}) {
  const pathname = usePathname();

  
  const paths = pathname.split("/").filter(path => path);

  
  const pathNames: Record<string, string> = {
    store: "Boutique",
    product: "Produit",
    shop: "Boutique",
    cart: "Panier",
    checkout: "Paiement",
    about: "À Propos",
    blog: "Blog",
    starter: "Débutant",
  };

  if (pathname === "/") return null;

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-6 animate-in fade-in slide-in-from-left-2 duration-500">
      <Link
        href="/"
        className="flex items-center hover:text-black transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        <span className="sr-only">Accueil</span>
      </Link>

      {paths.map((path, index) => {
        
        if (
          path === "store" &&
          paths[index + 1] &&
          (paths[index + 1] === "product" || paths[index + 1] === "about")
        )
          return null;

        const isLast = index === paths.length - 1;
        let href = `/${paths.slice(0, index + 1).join("/")}`;

        
        if (path === "product") {
          href = "/produits";
        }

        let label = pathNames[path] || path;

        
        if (isLast && productName) {
          label = productName;
        }

        
        if (!pathNames[path] && !productName) {
          label = label.charAt(0).toUpperCase() + label.slice(1);
        }

        return (
          <Fragment key={path}>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
            {isLast ? (
              <span className="font-medium text-black line-clamp-1 max-w-[200px]">
                {label}
              </span>
            ) : (
              <Link href={href} className="hover:text-black transition-colors">
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
