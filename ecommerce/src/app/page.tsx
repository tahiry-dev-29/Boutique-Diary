import MeherHero from "@/components/store/MeherHero";
import PromoSection from "@/components/store/PromoSection";
import CollectionScroll from "@/components/store/CollectionScroll";
import FeaturesSection from "@/components/store/FeaturesSection";
import ServiceHighlights from "@/components/store/ServiceHighlights";
import BestCollectionBanner from "@/components/store/BestCollectionBanner";
import StoreProductGrid from "@/components/store/StoreProductGrid";
import ClientTestimonials from "@/components/store/ClientTestimonials";
import StoreFooter from "@/components/store/StoreFooter";
import ScrollReveal from "@/components/store/ScrollReveal";
import {
  getFeaturedProducts,
  getTopSellingProducts,
  getPromotionalProducts,
  getCategoryProductsMap,
  getStoreStats,
  getTestimonials,
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
  const { customerCount, recentCustomers } = await getStoreStats();
  const testimonials = await getTestimonials(6);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <MeherHero
        customerCount={customerCount}
        recentCustomers={recentCustomers}
      />

      <ScrollReveal animation="fade-up" delay={200}>
        <PromoSection products={promotionalProducts} />
      </ScrollReveal>

      <ScrollReveal animation="fade-up" threshold={0.1}>
        <CategoryTabsSection productsMap={categoryProducts} />
      </ScrollReveal>

      <ScrollReveal animation="fade-left">
        <CollectionScroll products={topSellingProducts} />
      </ScrollReveal>

      <ScrollReveal animation="fade-up">
        <FeaturesSection
          customerCount={customerCount}
          recentCustomers={recentCustomers}
        />
      </ScrollReveal>

      <ScrollReveal animation="scale-up" delay={100}>
        <ServiceHighlights />
      </ScrollReveal>

      <ScrollReveal animation="fade-up">
        <BestCollectionBanner />
      </ScrollReveal>

      <ScrollReveal
        animation="fade-up"
        stagger={100}
        selector=".product-card-reveal"
      >
        <StoreProductGrid products={featuredProducts} />
      </ScrollReveal>

      <ClientTestimonials testimonials={testimonials} />

      <StoreFooter />
    </div>
  );
}
