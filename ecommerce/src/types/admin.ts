import { Category } from "./category";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN"; // Adjust roles as needed based on your auth system
}

export interface ProductImage {
  id?: number;
  url: string;
  reference?: string | null;
  color?: string | null;
  sizes?: string[];
  price?: number | null;
  oldPrice?: number | null;
  stock?: number | null;
  isNew?: boolean;
  isPromotion?: boolean;
  categoryId?: number | null;
}

export interface ProductVariation {
  id?: number;
  sku: string;
  productId?: number;
  color?: string | null;
  size?: string | null;
  price: number | string;
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
  oldPrice?: number | null;
  isBestSeller?: boolean;
  applyPromotions?: boolean; // Form-only field
  rating?: number | null;
  reviewCount?: number;
  variations?: ProductVariation[];
  createdAt?: string;
  updatedAt?: string;
}
