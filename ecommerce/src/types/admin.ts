import { Category } from "./category";

export interface ProductImage {
  id?: number;
  url: string;
  color?: string | null;
  sizes?: string[];
}

export interface Product {
  id?: number;
  name: string;
  description?: string | null;
  reference: string;
  images: ProductImage[];
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
