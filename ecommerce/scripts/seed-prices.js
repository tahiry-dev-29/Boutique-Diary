import { PrismaClient } from "../src/generated/prisma/client";
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.promoCode.updateMany({
    where: {
      ownerId: null,
      costPoints: { not: null },
      costMoney: null,
    },
    data: {
      costMoney: 15000, // Default price in Ar
    },
  });
  console.log(
    `Updated ${updated.count} promo codes with a default money price.`,
  );
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
