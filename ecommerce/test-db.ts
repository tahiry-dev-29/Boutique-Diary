import { prisma } from './src/lib/prisma'; async function main() { const codes = await prisma.promoCode.findMany(); console.log(codes); } main();
