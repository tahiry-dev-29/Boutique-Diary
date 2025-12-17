import MeherHero from "@/components/store/MeherHero";
import PromoSection from "@/components/store/PromoSection";
import CollectionScroll from "@/components/store/CollectionScroll";
import FeaturesSection from "@/components/store/FeaturesSection";
import ServiceHighlights from "@/components/store/ServiceHighlights";
import BestCollectionBanner from "@/components/store/BestCollectionBanner";
import StoreProductGrid from "@/components/store/StoreProductGrid";
import ClientTestimonials from "@/components/store/ClientTestimonials";
import StoreFooter from "@/components/store/StoreFooter";
import { getFeaturedProducts, getTopSellingProducts } from "@/lib/store-data";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts(12);
  const topSellingProducts = await getTopSellingProducts(4);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <MeherHero />
      <PromoSection />
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
