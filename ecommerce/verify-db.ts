import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting to create a test product...");
    const product = await prisma.product.create({
      data: {
        name: "Test Product " + Date.now(),
        reference: "REF-" + Date.now(),
        price: 100,
        stock: 10,
        images: {
          create: [
            { url: "https://example.com/image1.jpg" },
            { url: "https://example.com/image2.jpg" },
          ],
        },
        description: "This is a test product created via script.",
      },
    });
    console.log("Successfully created product:", product);
  } catch (error) {
    console.error("Error creating product:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
