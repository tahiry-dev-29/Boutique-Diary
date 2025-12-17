import ProductDetail from "@/components/store/ProductDetail";
import StoreProductGrid from "@/components/store/StoreProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import StoreBreadcrumb from "@/components/store/StoreBreadcrumb";
import { getProductById, getRelatedProducts } from "@/lib/store-data";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.categoryId || 0,
    product.id,
    4,
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-4">
        <StoreBreadcrumb productName={product.name} />
      </div>
      <ProductDetail product={product} />

      {/* "This item can be cool with this" Section */}
      <div className="bg-gray-50 pt-8 pb-0">
        <StoreProductGrid products={relatedProducts} />
      </div>

      <StoreFooter />
    </div>
  );
}
