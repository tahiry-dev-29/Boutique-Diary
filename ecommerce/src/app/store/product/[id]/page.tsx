import StoreNavbar from "@/components/store/StoreNavbar";
import ProductDetail from "@/components/store/ProductDetail";
import StoreProductGrid from "@/components/store/StoreProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import { getProductById, getRelatedProducts } from "@/lib/store-data";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

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
      <StoreNavbar />
      <ProductDetail product={product} />

      {/* "This item can be cool with this" Section */}
      <div className="bg-gray-50 pt-8 pb-0">
        <StoreProductGrid products={relatedProducts} />
      </div>

      <StoreFooter />
    </div>
  );
}
