import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { getCategories } from "@/lib/store-data";
import { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeStyle } from "@/components/store/theme-style";
import { getTheme } from "@/lib/theme/theme-service";

const playfair = localFont({
  src: "../../public/fonts/PlayfairDisplay-VariableFont_wght.ttf",
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = localFont({
  src: "../../public/fonts/Montserrat-VariableFont_wght.ttf",
  variable: "--font-montserrat",
  display: "swap",
});

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
  const theme = await getTheme();

  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-background dark:bg-gray-900/50 text-foreground">
        <ThemeStyle theme={theme} />
        <MainLayout categories={categories}>{children}</MainLayout>
      </body>
    </html>
  );
}
