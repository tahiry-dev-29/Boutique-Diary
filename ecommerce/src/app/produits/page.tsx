import StoreProductBanner from "@/components/store/StoreProductBanner";
import StoreProductGrid from "@/components/store/StoreProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import { getProducts } from "@/lib/store-data";

export default async function ProduitsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-4 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <StoreProductBanner />

        <div className="mb-12 border-b border-gray-100 pb-12">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 border-l-4 border-black pl-4">
              Découvrez nos articles
            </h2>
            <p className="max-w-3xl text-sm font-medium text-gray-500">
              Une sélection exclusive renouvelée chaque semaine avec le meilleur
              du design et de la durabilité.
            </p>
          </div>
        </div>

        <StoreProductGrid products={products} />
      </div>
      <StoreFooter />
    </div>
  );
}
