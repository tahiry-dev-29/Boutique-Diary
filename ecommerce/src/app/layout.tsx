import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { getCategories } from "@/lib/store-data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boutique Diary",
  description: "Votre destination shopping préférée",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased dark:bg-gray-900/50 text-foreground">
        <MainLayout categories={categories}>{children}</MainLayout>
      </body>
    </html>
  );
}
