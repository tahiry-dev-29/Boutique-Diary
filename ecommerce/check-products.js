import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log("🔍 Vérification des produits...\n");

    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        deletedAt: true,
      },
    });

    console.log(`📦 Total produits dans la base: ${allProducts.length}\n`);

    const activeProducts = allProducts.filter((p) => p.deletedAt === null);
    const deletedProducts = allProducts.filter((p) => p.deletedAt !== null);

    console.log(
      `✅ Produits actifs (deletedAt = null): ${activeProducts.length}`,
    );
    console.log(
      `🗑️  Produits supprimés (deletedAt ≠ null): ${deletedProducts.length}\n`,
    );

    console.log("📋 Liste des produits actifs:");
    activeProducts.forEach((p) => {
      console.log(`  - ID: ${p.id} | Nom: ${p.name} | Status: ${p.status}`);
    });

    if (deletedProducts.length > 0) {
      console.log("\n🗑️  Liste des produits supprimés:");
      deletedProducts.forEach((p) => {
        console.log(
          `  - ID: ${p.id} | Nom: ${p.name} | Supprimé le: ${p.deletedAt}`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
