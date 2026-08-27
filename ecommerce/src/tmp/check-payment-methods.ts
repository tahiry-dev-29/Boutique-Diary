import { prisma } from "@/lib/prisma";
async function main() {
  const methods = await prisma.paymentMethod.findMany();
  console.log(JSON.stringify(methods, null, 2));
}
main().finally(() => prisma.$disconnect());
