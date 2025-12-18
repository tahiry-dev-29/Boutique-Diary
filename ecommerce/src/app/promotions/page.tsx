import StoreProductBanner from "@/components/store/StoreProductBanner";
import StoreProductList from "@/components/store/StoreProductList";
import StoreFooter from "@/components/store/StoreFooter";
import { getProducts, getStoreStats, getCategories } from "@/lib/store-data";

export default async function PromotionsPage() {
  const [products, stats, categories] = await Promise.all([
    getProducts({ isPromotion: true }),
    getStoreStats(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-4 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <StoreProductBanner
          title="Nos Promotions"
          subtitle="Profitez de tarifs exceptionnels sur une sélection d'articles. Des offres limitées à ne pas manquer pour renouveler votre style."
          badge="Offres Spéciales"
          customerCount={stats.customerCount}
          recentCustomers={stats.recentCustomers}
          variant="rose"
          enableTypewriter={true}
        />

        <div className="mb-12 border-b border-gray-100 pb-12">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-black tracking-tight text-rose-600 border-l-4 border-rose-600 pl-4">
              Ventes Privées & Promos
            </h2>
            <p className="max-w-3xl text-sm font-medium text-gray-500">
              Découvrez des pièces uniques à prix réduits. Qualité premium, prix
              accessibles.
            </p>
          </div>
        </div>

        <StoreProductList initialProducts={products} categories={categories} />
      </div>
      <StoreFooter />
    </div>
  );
}
