// Products feature exports

// Components
export { default as ProductForm } from "./components/ProductForm";
export {
  ProductFormFields,
  ProductPricing,
  ProductVariants,
  ProductImageUploader,
} from "./components/ProductForm";
export type { ProductFormProps } from "./components/ProductForm";

export { default as ProductList } from "./components/ProductList";
export {
  ProductFilters,
  ProductTable,
  ProductPagination,
} from "./components/ProductList";
export type { ProductFiltersState } from "./components/ProductList";
export type { ProductListProps } from "./components/ProductList";

// Hooks
export { useProducts } from "./hooks/useProducts";

// Types
export type { Product, ProductImage, ProductVariation } from "@/types/admin";
