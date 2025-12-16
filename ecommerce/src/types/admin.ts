import { Category } from "./category";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
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
  isBestSeller?: boolean;
  promotionRuleId?: number | null;
  categoryId?: number | null;
}

export interface ProductVariation {
  id?: number;
  sku: string;
  productId?: number;
  color?: string | null;
  size?: string | null;
  price: number | string;
  oldPrice?: number | string | null;
  stock: number;
  isActive?: boolean;
  promotionRuleId?: number | null;
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
  applyPromotions?: boolean;
  rating?: number | null;
  reviewCount?: number;
  variations?: ProductVariation[];
  createdAt?: string;
  promotionRuleId?: number | null;
  promotionRule?: any;
  updatedAt?: string;
}
