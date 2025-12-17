import StoreProductGrid from "@/components/store/StoreProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import { getProducts, getCategories } from "@/lib/store-data";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await searchParams;
  const categoryId = category ? parseInt(category as string) : undefined;

  const products = await getProducts({ categoryId });
  const categories = await getCategories();

  // Find current category name if selected
  const currentCategory = categoryId
    ? categories.find(c => c.id === categoryId)
    : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-8 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {currentCategory ? currentCategory.name : "Toute la Boutique"}
          </h1>
          <p className="text-gray-500">
            {currentCategory
              ? `Découvrez notre collection ${currentCategory.name}`
              : "Explorez notre collection complète de produits de qualité."}
          </p>
        </div>

        <StoreProductGrid products={products} />
      </div>
      <StoreFooter />
    </div>
  );
}
