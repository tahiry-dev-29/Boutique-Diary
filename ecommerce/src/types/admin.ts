import { Category } from "./category";

export interface ProductImage {
  id?: number;
  url: string;
  color?: string | null;
  sizes?: string[];
  price?: number | null; // Prix spécifique pour cette image
  stock?: number | null; // Stock spécifique pour cette image
}

export interface ProductVariation {
  id?: number;
  sku: string;
  productId?: number;
  color?: string | null;
  size?: string | null;
  price: number | string; // Decimal can be string or number
  stock: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id?: number;
  name: string;
  description?: string | null;
  reference: string;
  images?: (string | ProductImage)[];
  price: number;
  stock: number;
  categoryId?: number | null;
  category?: Category | null;
  brand?: string | null;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  isPromotion?: boolean;
  isBestSeller?: boolean;
  rating?: number | null;
  reviewCount?: number;
  variations?: ProductVariation[];
  createdAt?: string;
  updatedAt?: string;
}
