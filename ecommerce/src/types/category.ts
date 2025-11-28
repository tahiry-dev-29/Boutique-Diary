export interface Category {
  id?: number;
  name: string;
  description?: string | null;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    products: number;
  };
}
