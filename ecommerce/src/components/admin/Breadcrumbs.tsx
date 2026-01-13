"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const segmentLabels: Record<string, string> = {
  admin: "Admin",
  dashboard: "Tableau de bord",
  employees: "Employés",
  customers: "Clients",
  products: "Produits",
  orders: "Commandes",
  settings: "Paramètres",
  new: "Nouveau",
  edit: "Modifier",
  roles: "Rôles",
  categories: "Catégories",
  stock: "Stock",
};

export const Breadcrumbs = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((segment) => segment !== "");

  // Don't show on admin root (dashboard) if you prefer, or show "Admin"
  if (segments.length === 0) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = segmentLabels[segment] || segment;

          const displayLabel = segmentLabels[segment]
            ? label
            : label.charAt(0).toUpperCase() + label.slice(1);

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{displayLabel}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{displayLabel}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
