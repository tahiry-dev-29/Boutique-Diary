import { Category } from "./category";

export interface Product {
  id?: number;
  name: string;
  description?: string | null;
  reference: string;
  images: string[];
  price: number;
  stock: number;

  // Nouveaux champs
  brand?: string;
  colors?: string[];
  sizes?: string[];

  isNew?: boolean;
  isPromotion?: boolean;
  isBestSeller?: boolean;

  rating?: number;
  reviewCount?: number;

  categoryId?: number | null;
  category?: Category | null;
}
