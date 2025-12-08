import HeroSection from "@/components/home/HeroSection";
import ProductsShowcase from "@/components/home/ProductsShowcase";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProductsShowcase />
    </div>
  );
}
