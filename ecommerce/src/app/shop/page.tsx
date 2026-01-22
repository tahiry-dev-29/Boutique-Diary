import StoreProductGrid from "@/components/store/StoreProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import StoreProductBanner from "@/components/store/StoreProductBanner";
import ScrollReveal from "@/components/store/ScrollReveal";
import { getProducts, getCategories, getStoreStats } from "@/lib/store-data";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category;
  const categoryId = category ? parseInt(category as string) : undefined;

  const products = await getProducts({ categoryId });
  const categories = await getCategories();
  const stats = await getStoreStats();

  const currentCategory = categoryId
    ? categories.find(c => c.id === categoryId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-4 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <StoreProductBanner
          title={currentCategory ? currentCategory.name : "Toute la Boutique"}
          subtitle={
            currentCategory
              ? `Plongez dans notre univers ${currentCategory.name}. Une sélection rigoureuse alliant savoir-faire et design contemporain.`
              : "Explorez l'intégralité de nos collections. Des produits d'exception conçus pour durer et sublimer votre quotidien."
          }
          badge={currentCategory ? "Collection" : "Catalogue"}
          customerCount={stats.customerCount}
          recentCustomers={stats.recentCustomers}
          variant="indigo"
          enableTypewriter={true}
        />

        <ScrollReveal
          animation="fade-up"
          stagger={50}
          selector=".product-card-reveal"
        >
          <StoreProductGrid
            products={products}
            showTitle={false}
            showFooter={false}
          />
        </ScrollReveal>
      </div>
      <StoreFooter />
    </div>
  );
}
