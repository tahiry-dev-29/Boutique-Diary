import StoreProductGrid from "@/components/store/StoreProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import StoreProductBanner from "@/components/store/StoreProductBanner";
import ScrollReveal from "@/components/store/ScrollReveal";
import { getProducts, getStoreStats } from "@/lib/store-data";

export default async function NouveautesPage() {
  const [products, stats] = await Promise.all([
    getProducts({ isNew: true }),
    getStoreStats(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-4 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <StoreProductBanner
          title="Nouveautés"
          subtitle="Découvrez nos dernières créations fraîchement arrivées en boutique. Soyez les premiers à arborer nos nouvelles tendances."
          badge="Nouveaux Arrivages"
          customerCount={stats.customerCount}
          recentCustomers={stats.recentCustomers}
          variant="cyan"
          enableTypewriter={true}
        />

        <ScrollReveal
          animation="fade-up"
          stagger={50}
          selector=".product-card-reveal"
        >
          {products.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
              <p className="text-gray-400 font-medium italic">
                Aucune nouveauté pour le moment.
              </p>
            </div>
          ) : (
            <StoreProductGrid
              products={products}
              showTitle={false}
              showFooter={false}
            />
          )}
        </ScrollReveal>
      </div>
      <StoreFooter />
    </div>
  );
}
