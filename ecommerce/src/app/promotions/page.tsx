import StoreProductGrid from "@/components/store/StoreProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import { getProducts } from "@/lib/store-data";

export default async function PromotionsPage() {
  const products = await getProducts({ isPromotion: true });

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-8 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <header className="mb-12 border-b border-gray-100 pb-12">
          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold uppercase tracking-widest text-rose-500 animate-in fade-in slide-in-from-left-4 duration-700">
              Offres Spéciales
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-left-4 duration-700 delay-100 fill-mode-both">
              Nos Promotions
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-gray-600 animate-in fade-in slide-in-from-left-4 duration-700 delay-200 fill-mode-both">
              Profitez de tarifs exceptionnels sur une sélection d'articles. Des
              offres limitées à ne pas manquer.
            </p>
          </div>
        </header>

        {products.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
            <p className="text-gray-400 font-medium italic">
              Aucune promotion en cours pour le moment.
            </p>
          </div>
        ) : (
          <StoreProductGrid products={products} />
        )}
      </div>
      <StoreFooter />
    </div>
  );
}
