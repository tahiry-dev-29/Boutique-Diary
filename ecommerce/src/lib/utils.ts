import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return "0 Ar";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0 Ar";

  return new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: "MGA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(numPrice)
    .replace("MGA", "Ar");
}
