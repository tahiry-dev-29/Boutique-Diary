import { prisma } from "./prisma";

async function main() {
  console.log("Testing Prisma Connection...");
  try {
    // Check if the model exists on the client
    if (!prisma.contactMessage) {
      console.error("❌ prisma.contactMessage is UNDEFINED!");
      console.log("Available keys on prisma:", Object.keys(prisma));
      process.exit(1);
    }

    console.log("✅ prisma.contactMessage exists.");

    const count = await prisma.contactMessage.count();
    console.log(`✅ Connection successful. Current message count: ${count}`);
    process.exit(0);
  } catch (e) {
    console.error("❌ Error querying database:", e);
    process.exit(1);
  }
}

main();
