import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("💳 Creating payment methods...");
  
  // Create default payment methods safely
  const paymentMethods = [
    {
      code: "mvola",
      name: "MVola",
      description: "Paiement mobile via Telma MVola",
      isActive: true,
      isDefault: true,
      config: { merchantId: "123456" },
    },
    {
      code: "orange_money",
      name: "Orange Money",
      description: "Paiement mobile via Orange Money",
      isActive: true,
      isDefault: false,
    },
    {
      code: "airtel_money",
      name: "Airtel Money",
      description: "Paiement mobile via Airtel Money Madagascar",
      isActive: true,
      isDefault: false,
    },
    {
      code: "cash",
      name: "Paiement à la livraison",
      description: "Payer en espèces à la réception de votre commande",
      isActive: true,
      isDefault: false,
    },
    {
      code: "stripe",
      name: "Carte Bancaire",
      description: "Paiement sécurisé par carte (Stripe)",
      isActive: true,
      isDefault: false,
    },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: pm.code },
      update: {},
      create: pm,
    });
  }

  console.log("✅ Payment methods added successfully without touching other data!");
}

main()
  .catch(e => {
    console.error("❌ Seeding payments failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
