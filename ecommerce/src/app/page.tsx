import MeherHero from "@/components/store/MeherHero";
import PromoSection from "@/components/store/PromoSection";
import CollectionScroll from "@/components/store/CollectionScroll";
import FeaturesSection from "@/components/store/FeaturesSection";
import ServiceHighlights from "@/components/store/ServiceHighlights";
import BestCollectionBanner from "@/components/store/BestCollectionBanner";
import StoreProductGrid from "@/components/store/StoreProductGrid";
import ClientTestimonials from "@/components/store/ClientTestimonials";
import StoreFooter from "@/components/store/StoreFooter";
import {
  getFeaturedProducts,
  getTopSellingProducts,
  getPromotionalProducts,
  getCategoryProductsMap,
} from "@/lib/store-data";
import CategoryTabsSection from "@/components/store/CategoryTabsSection";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts(12);
  const topSellingProducts = await getTopSellingProducts(4);
  const promotionalProducts = await getPromotionalProducts(3);
  const categoryProducts = await getCategoryProductsMap([
    "Shoes",
    "Clothing",
    "Accessories",
    "Jewellery",
  ]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <MeherHero />
      <PromoSection products={promotionalProducts} />
      <CategoryTabsSection productsMap={categoryProducts} />
      <CollectionScroll products={topSellingProducts} />
      <FeaturesSection />
      <ServiceHighlights />
      <BestCollectionBanner />
      <StoreProductGrid products={featuredProducts} />
      <ClientTestimonials />
      <StoreFooter />
    </div>
  );
}
