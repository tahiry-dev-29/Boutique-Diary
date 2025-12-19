import StoreProductGrid from "@/components/store/StoreProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import StoreProductBanner from "@/components/store/StoreProductBanner";
import ScrollReveal from "@/components/store/ScrollReveal";
import { getProducts, getStoreStats } from "@/lib/store-data";

export default async function TopVentePage() {
  const [products, stats] = await Promise.all([
    getProducts({ isBestSeller: true }),
    getStoreStats(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-4 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <StoreProductBanner
          title="Top Ventes"
          subtitle="Les articles préférés de nos clients. Découvrez les pièces les plus plébiscitées de notre collection."
          badge="Best Sellers"
          customerCount={stats.customerCount}
          recentCustomers={stats.recentCustomers}
          variant="amber"
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
                Aucun top vente pour le moment.
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
