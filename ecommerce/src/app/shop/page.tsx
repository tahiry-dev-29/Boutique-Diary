import StoreProductGrid from "@/components/store/StoreProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import { getProducts, getCategories, getStoreStats } from "@/lib/store-data";
import Image from "next/image";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await searchParams;
  const categoryId = category ? parseInt(category as string) : undefined;

  const products = await getProducts({ categoryId });
  const categories = await getCategories();
  const { customerCount, recentCustomers } = await getStoreStats();

  const displayCount = customerCount;
  const displayAvatars =
    recentCustomers.length > 0
      ? recentCustomers.map(c => ({
          url: `https://i.pravatar.cc/150?u=${c.id}`,
          name: c.username,
        }))
      : [
          { url: "https://i.pravatar.cc/150?u=1", name: "Client" },
          { url: "https://i.pravatar.cc/150?u=2", name: "Client" },
          { url: "https://i.pravatar.cc/150?u=3", name: "Client" },
          { url: "https://i.pravatar.cc/150?u=4", name: "Client" },
        ];

  // Find current category name if selected
  const currentCategory = categoryId
    ? categories.find(c => c.id === categoryId)
    : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-8 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <header className="mb-12 border-b border-gray-100 pb-12 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold uppercase tracking-widest text-indigo-600 animate-in fade-in slide-in-from-left-4 duration-700">
                {currentCategory ? "Collection" : "Catalogue"}
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-left-4 duration-700 delay-100 fill-mode-both">
                {currentCategory ? currentCategory.name : "Toute la Boutique"}
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-gray-600 animate-in fade-in slide-in-from-left-4 duration-700 delay-200 fill-mode-both">
                {currentCategory
                  ? `Plongez dans notre univers ${currentCategory.name}. Une sélection rigoureuse alliant savoir-faire et design contemporain.`
                  : "Explorez l'intégralité de nos collections. Des produits d'exception conçus pour durer et sublimer votre quotidien."}
              </p>
            </div>

            {/* Social Proof Badge */}
            <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl ring-1 ring-gray-100 animate-in fade-in slide-in-from-right-4 duration-700 delay-300 fill-mode-both">
              <div className="flex -space-x-3">
                {displayAvatars.map((client, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-sm transition-transform hover:scale-110"
                  >
                    <Image
                      src={client.url}
                      alt={client.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm">
                  +
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 leading-none tracking-tight">
                  {displayCount}+
                </span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clients Satisfaits
                </span>
              </div>
            </div>
          </div>
        </header>

        <StoreProductGrid products={products} />
      </div>
      <StoreFooter />
    </div>
  );
}
