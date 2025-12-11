import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  {
    name: "Hommes",
    slug: "hommes",
    description: "Vêtements et accessoires pour hommes",
  },
  {
    name: "Femmes",
    slug: "femmes",
    description: "Vêtements et accessoires pour femmes",
  },
  { name: "Enfants", slug: "enfants", description: "Mode pour enfants" },
  {
    name: "Accessoires",
    slug: "accessoires",
    description: "Sacs, ceintures, chapeaux...",
  },
  {
    name: "Sport",
    slug: "sport",
    description: "Équipements et vêtements de sport",
  },
];

const BRANDS = [
  "Nike",
  "Adidas",
  "Zara",
  "H&M",
  "Uniqlo",
  "Levi's",
  "Puma",
  "Gucci",
  "Ralph Lauren",
  "Calvin Klein",
];
const COLORS = [
  "Rouge",
  "Bleu",
  "Vert",
  "Noir",
  "Blanc",
  "Jaune",
  "Rose",
  "Gris",
  "Beige",
  "Marron",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44"];
const PRODUCT_TYPES = [
  "T-Shirt",
  "Jean",
  "Veste",
  "Robe",
  "Pantalon",
  "Short",
  "Pull",
  "Chemise",
  "Sweat",
  "Manteau",
];
const STYLES = [
  "Classic",
  "Modern",
  "Vintage",
  "Urban",
  "Sport",
  "Casual",
  "Chic",
  "Streetwear",
];

// Helper to get random item from array
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomSubset = <T>(arr: T[], min = 1, max = 3): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * (max - min + 1)) + min);
};

async function main() {
  console.log("Start seeding...");

  // Clean DB
  try {
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    console.log("Database cleaned.");
  } catch (error) {
    console.warn("Error cleaning database (might be empty):", error);
  }

  // Create Categories
  const categories = [];
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({ data: cat });
    categories.push(created);
  }
  console.log(`Created ${categories.length} categories.`);

  // Create Products
  for (let i = 0; i < 50; i++) {
    const category = random(categories);
    const brand = random(BRANDS);
    const productColors = randomSubset(COLORS, 2, 4);
    const productSizes = randomSubset(SIZES, 3, 5);
    const isNew = Math.random() > 0.8;
    const isPromotion = Math.random() > 0.8;
    const isBestSeller = Math.random() > 0.9;
    const type = random(PRODUCT_TYPES);
    const style = random(STYLES);

    const name = `${brand} ${type} ${style}`;

    // Generate images with attributes
    const imagesData = [];
    // Main image
    imagesData.push({
      url: `https://placehold.co/600x600/EEE/31343C?text=${encodeURIComponent(name)}`,
      color: null,
      sizes: [],
    });

    // Color variations
    for (const color of productColors) {
      // Simple color mapping for placeholder background
      let bg = "EEE";
      if (color === "Rouge") bg = "FF0000";
      if (color === "Bleu") bg = "0000FF";
      if (color === "Vert") bg = "00FF00";
      if (color === "Noir") bg = "000000";
      if (color === "Jaune") bg = "FFFF00";

      const textColor = ["Noir", "Bleu", "Rouge"].includes(color)
        ? "FFFFFF"
        : "000000";

      imagesData.push({
        url: `https://placehold.co/600x600/${bg}/${textColor}?text=${encodeURIComponent(color)}`,
        color: color,
        sizes: [],
      });
    }

    await prisma.product.create({
      data: {
        name,
        description: `Découvrez notre ${name} de la collection ${category.name}. Un incontournable de la marque ${brand}. Conçu pour allier style et confort, ce modèle ${style.toLowerCase()} saura vous séduire.`,
        reference: `REF-${Math.floor(Math.random() * 100000)}`,
        price: parseFloat((Math.random() * 150 + 20).toFixed(2)),
        stock: Math.floor(Math.random() * 100),
        categoryId: category.id,
        brand,
        colors: productColors,
        sizes: productSizes,
        isNew,
        isPromotion,
        isBestSeller,
        images: {
          create: imagesData,
        },
      },
    });
  }

  // Create default admin user with SUPERADMIN role
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@boutique.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@boutique.com",
        password: hashedPassword,
        role: "SUPERADMIN",
        isActive: true,
      },
    });
    console.log("Created default admin: admin@boutique.com / admin123");
  } else {
    console.log("Admin already exists, skipping...");
  }

  console.log("Seeding finished. Created 50 products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
