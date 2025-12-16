import ClientNavbar from "@/components/client/ClientNavbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ClientNavbar />
      <main className="flex-1">{children}</main>

      {}
      <footer className="dark:border-gray-700/50 border-t border-border py-8 px-4 mt-auto">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-bold text-foreground mb-4">BOUTIQUE DIARY</h3>
            <p className="text-muted-foreground">
              Votre destination shopping préférée pour des produits de qualité.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Navigation</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="/shop"
                  className="hover:text-foreground transition-colors"
                >
                  Boutique
                </a>
              </li>
              <li>
                <a
                  href="/shop?promo=true"
                  className="hover:text-foreground transition-colors"
                >
                  Promotions
                </a>
              </li>
              <li>
                <a
                  href="/categories"
                  className="hover:text-foreground transition-colors"
                >
                  Catégories
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Mon Compte</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="/customer/auth"
                  className="hover:text-foreground transition-colors"
                >
                  Connexion
                </a>
              </li>
              <li>
                <a
                  href="/customer/orders"
                  className="hover:text-foreground transition-colors"
                >
                  Mes commandes
                </a>
              </li>
              <li>
                <a
                  href="/customer/wishlist"
                  className="hover:text-foreground transition-colors"
                >
                  Mes favoris
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Aide</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Livraison
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-8 pt-6 border-t border-border text-center text-muted-foreground text-xs">
          © 2024 Boutique Diary. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
