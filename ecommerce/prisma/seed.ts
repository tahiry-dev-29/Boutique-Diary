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
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany({ where: { role: "CUSTOMER" } }); // Keep admins safe if possible, or just clean all users
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
  const products = [];
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
    const price = parseFloat((Math.random() * 150 + 20).toFixed(2));

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

    const product = await prisma.product.create({
      data: {
        name,
        description: `Découvrez notre ${name} de la collection ${category.name}. Un incontournable de la marque ${brand}. Conçu pour allier style et confort, ce modèle ${style.toLowerCase()} saura vous séduire.`,
        reference: `REF-${Math.floor(Math.random() * 100000)}`,
        price,
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
    products.push(product);
  }
  console.log(`Created ${products.length} products.`);

  // Create Customers
  const customers = [];
  const customerPassword = await bcrypt.hash("client123", 10);

  // Default client
  const defaultClient = await prisma.user.create({
    data: {
      username: "Jean Dupont",
      email: "client@boutique.com",
      password: customerPassword,
      role: "CUSTOMER",
      isActive: true,
    },
  });
  customers.push(defaultClient);

  // Random customers
  for (let i = 0; i < 20; i++) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 60)); // Registered within last 60 days

    const customer = await prisma.user.create({
      data: {
        username: `Client ${i + 1}`,
        email: `client${i + 1}@test.com`,
        password: customerPassword,
        role: "CUSTOMER",
        isActive: true,
        createdAt,
      },
    });
    customers.push(customer);
  }
  console.log(`Created ${customers.length} customers.`);

  // Create Orders (History)
  const ORDER_STATUSES = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
  ];

  for (let i = 0; i < 100; i++) {
    const customer = random(customers);
    const isRecent = Math.random() > 0.3; // 70% chance of being recent (last 30 days)
    const daysAgo = isRecent
      ? Math.floor(Math.random() * 30)
      : Math.floor(Math.random() * 60);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    // Random items
    const numItems = Math.floor(Math.random() * 4) + 1;
    const orderItemsData = [];
    let total = 0;

    for (let j = 0; j < numItems; j++) {
      const product = random(products);
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemTotal = product.price * quantity;
      total += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity,
        price: product.price,
      });
    }

    // Determine status based on age - older orders likely delivered
    let status = "PENDING";
    if (daysAgo > 10) status = random(["DELIVERED", "COMPLETED", "SHIPPED"]);
    else status = random(ORDER_STATUSES);

    // Some cancellations
    if (Math.random() > 0.9) status = "CANCELLED";

    await prisma.order.create({
      data: {
        reference: `ORD-${createdAt.getFullYear()}${(createdAt.getMonth() + 1).toString().padStart(2, "0")}-${1000 + i}`,
        total: parseFloat(total.toFixed(2)),
        status,
        customerId: customer.id,
        createdAt,
        updatedAt: createdAt, // simplified
        items: {
          create: orderItemsData,
        },
      },
    });
  }
  console.log("Created ~100 orders with history.");

  // Create default admin user in ADMIN table (for back-office)
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: "admin@boutique.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.admin.create({
      data: {
        name: "Super Admin",
        email: "admin@boutique.com",
        password: hashedPassword,
        role: "superadmin",
        isActive: true,
      },
    });
    console.log(
      "Created default back-office admin: admin@boutique.com / admin123",
    );
  } else {
    console.log("Back-office Admin already exists, skipping...");
  }

  console.log("Seeding finished.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
