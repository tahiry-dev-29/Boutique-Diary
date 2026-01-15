import StoreFooter from "@/components/store/StoreFooter";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold mb-8">Our Blog</h1>
        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
          Latest news, trends, and stories from the Diary Boutique team. Stay
          tuned for updates! (This page is under construction).
        </p>
      </div>
      <StoreFooter />
    </div>
  );
}
