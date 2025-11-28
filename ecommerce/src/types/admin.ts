import { Category } from "./category";

export interface Product {
  id?: number;
  name: string;
  description?: string | null;
  reference: string;
  images: string[];
  price: number;
  stock: number;
  categoryId?: number | null;
  category?: Category | null;
}
