import StoreProductBanner from "@/components/store/StoreProductBanner";
import StoreProductList from "@/components/store/StoreProductList";
import StoreFooter from "@/components/store/StoreFooter";
import { getProducts, getStoreStats, getCategories } from "@/lib/store-data";

export default async function ProduitsPage() {
  const [products, stats, categories] = await Promise.all([
    getProducts(),
    getStoreStats(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-4 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <StoreProductBanner
          title="Tous nos Produits"
          subtitle="Parcourez l'intégralité de notre collection. Des pièces uniques conçus avec passion pour sublimer votre quotidien."
          badge="Catalogue Complet"
          customerCount={stats.customerCount}
          recentCustomers={stats.recentCustomers}
          variant="indigo"
        />

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

        <StoreProductList initialProducts={products} categories={categories} />
      </div>
      <StoreFooter />
    </div>
  );
}
