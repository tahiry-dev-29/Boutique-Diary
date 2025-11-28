export interface Product {
  id?: number;
  name: string;
  description?: string | null;
  reference: string;
  image?: string | null;
  price: number;
  stock: number;
}
