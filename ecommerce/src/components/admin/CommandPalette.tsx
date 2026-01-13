"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const navSections = [
  {
    items: [{ id: "dashboard", label: "Vue d'ensemble", href: "/admin" }],
  },
  {
    title: "Catalogue",
    items: [
      { id: "products", label: "Produits", href: "/admin/products" },
      { id: "categories", label: "Catégories", href: "/admin/categories" },
      {
        id: "stock",
        label: "Gestion des Stocks",
        href: "/admin/products/stock",
      },
    ],
  },
  {
    title: "Ventes",
    items: [
      { id: "orders", label: "Commandes", href: "/admin/orders" },
      { id: "customers", label: "Clients", href: "/admin/customers" },
    ],
  },
  {
    title: "Gestion",
    items: [
      { id: "employees", label: "Employés", href: "/admin/employees" },
      {
        id: "marketing",
        label: "Marketing",
        subItems: [
          {
            id: "promo-codes",
            label: "Codes promo",
            href: "/admin/marketing/codes-promo",
          },
          {
            id: "promotions",
            label: "Règles",
            href: "/admin/marketing/promotions",
          },
        ],
      },
      {
        id: "reports",
        label: "Rapports",
        subItems: [
          {
            id: "sales-reports",
            label: "Ventes",
            href: "/admin/reports/sales",
          },
          {
            id: "product-reports",
            label: "Produits",
            href: "/admin/reports/products",
          },
          {
            id: "customer-reports",
            label: "Clients",
            href: "/admin/reports/customers",
          },
        ],
      },
    ],
  },
  {
    title: "Paramètres",
    items: [
      {
        id: "payment",
        label: "Paiement",
        subItems: [
          {
            id: "payment-methods",
            label: "Méthodes de paiement",
            href: "/admin/payment/methods",
          },
          {
            id: "transactions",
            label: "Transactions",
            href: "/admin/payment/transactions",
          },
        ],
      },
      {
        id: "shipping",
        label: "Livraison",
        subItems: [
          {
            id: "shipping-methods",
            label: "Méthodes de livraison",
            href: "/admin/shipping/methods",
          },
          {
            id: "shipping-zones",
            label: "Zones de livraison",
            href: "/admin/shipping/zones",
          },
        ],
      },
      {
        id: "appearance",
        label: "Apparence",
        subItems: [
          { id: "logo", label: "Logo", href: "/admin/appearance/logo" },
          { id: "banner", label: "Bannière", href: "/admin/appearance/banner" },
          {
            id: "layout",
            label: "Disposition",
            href: "/admin/appearance/layout",
          },
        ],
      },
    ],
  },
];

function flattenNavSections(sections: any[]): NavItem[] {
  const items: NavItem[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      if (item.href) {
        items.push({ id: item.id, label: item.label, href: item.href });
      }
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.href) {
            items.push({
              id: subItem.id,
              label: `${item.label} > ${subItem.label}`,
              href: subItem.href,
            });
          }
        }
      }
    }
  }
  return items;
}

export function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const navItems = useMemo(() => flattenNavSections(navSections), []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0">
        <Command>
          <DialogHeader className="hidden">
            <DialogTitle>Command Palette</DialogTitle>
          </DialogHeader>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Pages">
              {navItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    runCommand(() => router.push(item.href));
                  }}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
