import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ===========================================
// CONFIGURATION
// ===========================================

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
  "Noir",
  "Blanc",
  "Bleu",
  "Rouge",
  "Gris",
  "Beige",
  "Vert",
  "Rose",
  "Marron",
  "Jaune",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
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

const COLOR_CODES: Record<string, string> = {
  Noir: "NO",
  Blanc: "BC",
  Bleu: "BL",
  Rouge: "RO",
  Gris: "GR",
  Beige: "BE",
  Vert: "VE",
  Rose: "RS",
  Marron: "MA",
  Jaune: "JA",
};

// Real product images from Unsplash
const PRODUCT_IMAGES: Record<string, string[]> = {
  "T-Shirt": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop",
  ],
  Jean: [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop",
  ],
  Veste: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600&h=600&fit=crop",
  ],
  Robe: [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop",
  ],
  Pantalon: [
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop",
  ],
  Short: [
    "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=600&fit=crop",
  ],
  Pull: [
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop",
  ],
  Chemise: [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop",
  ],
  Sweat: [
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop",
  ],
  Manteau: [
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=600&fit=crop",
  ],
};

const CUSTOMER_PHOTOS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
];

const CUSTOMER_NAMES = [
  "Marie Martin",
  "Pierre Bernard",
  "Sophie Dubois",
  "Lucas Thomas",
  "Emma Robert",
  "Hugo Richard",
  "Léa Petit",
  "Gabriel Durand",
  "Chloé Leroy",
  "Louis Moreau",
];

const REVIEW_COMMENTS = [
  "Super produit, je recommande !",
  "La qualité est au rendez-vous.",
  "Un peu cher mais ça vaut le coup.",
  "Livraison rapide et soignée.",
  "Taille un peu petit, prenez une taille au dessus.",
  "Couleur conforme à la photo.",
  "Très confortable, je l'adore !",
  "Parfait pour le quotidien.",
  "Design très moderne.",
  "Excellent rapport qualité/prix.",
];

// ===========================================
// HELPERS
// ===========================================

const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomSubset = <T>(arr: T[], min = 2, max = 4): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, randomInt(min, max));
};

function generateReference(
  brand: string,
  index: number,
  color?: string,
): string {
  const brandCode = brand.substring(0, 2).toUpperCase();
  const numPart = index.toString().padStart(4, "0");
  if (color && COLOR_CODES[color]) {
    return `${brandCode}${numPart}-${COLOR_CODES[color]}`;
  }
  return `${brandCode}${numPart}`;
}

// ===========================================
// IMAGE DOWNLOAD
// ===========================================

const imageCache = new Map<string, string>();

async function downloadImage(url: string, prefix: string): Promise<string> {
  if (imageCache.has(url)) return imageCache.get(url)!;

  try {
    console.log(`      📥 Downloading: ${url.substring(0, 50)}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicPath = `/uploads/${filename}`;
    imageCache.set(url, publicPath);
    return publicPath;
  } catch (error) {
    console.warn(`      ⚠️ Failed to download: ${url}`);
    return "/uploads/placeholder.jpg";
  }
}

// ===========================================
// MAIN SEED FUNCTION
// ===========================================

async function main() {
  console.log("🚀 Starting seeding with 50 products...\n");

  // Clean DB
  console.log("🧹 Cleaning database...");
  await prisma.stockMovement.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.promotionRule.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Database cleaned.\n");

  // Create Categories
  console.log("📁 Creating categories...");
  const categories: Array<{ id: number; name: string; slug: string }> = [];
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({ data: cat });
    categories.push(created);
  }
  console.log(`✅ Created ${categories.length} categories.\n`);

  // Create Promotion Rules
  console.log("🏷️ Creating promotion rules...");
  const promos = await Promise.all([
    prisma.promotionRule.create({
      data: {
        name: "Soldes d'été -20%",
        priority: 1,
        conditions: { type: "cart_total_gt", value: 50000 },
        actions: { type: "discount_percentage", value: 20 },
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-08-31"),
        isActive: true,
      },
    }),
    prisma.promotionRule.create({
      data: {
        name: "Flash Sale -30%",
        priority: 2,
        conditions: { type: "product_category", value: "sport" },
        actions: { type: "discount_percentage", value: 30 },
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${promos.length} promotion rules.\n`);

  // Create Promo Codes
  console.log("🎫 Creating promo codes...");
  const promoCodes = await Promise.all([
    prisma.promoCode.create({
      data: {
        code: "WELCOME10",
        type: "PERCENTAGE",
        value: 10,
        minOrderAmount: 20000,
        usageLimit: 100,
        costPoints: null,
        isActive: true,
      },
    }),
    prisma.promoCode.create({
      data: {
        code: "DIARY5000",
        type: "FIXED_AMOUNT",
        value: 5000,
        minOrderAmount: 50000,
        usageLimit: 50,
        isActive: true,
      },
    }),
    prisma.promoCode.create({
      data: {
        code: "VIP25",
        type: "PERCENTAGE",
        value: 25,
        minOrderAmount: 100000,
        usageLimit: 20,
        costPoints: null,
        isActive: true,
      },
    }),
    prisma.promoCode.create({
      data: {
        code: "REWARD10",
        type: "PERCENTAGE",
        value: 10,
        minOrderAmount: 0,
        usageLimit: 1,
        costPoints: 50,
        isActive: true,
      },
    }),
    prisma.promoCode.create({
      data: {
        code: "REWARD5000",
        type: "FIXED_AMOUNT",
        value: 5000,
        minOrderAmount: 20000,
        usageLimit: 1,
        costPoints: 100,
        isActive: true,
      },
    }),
    prisma.promoCode.create({
      data: {
        code: "VIP50",
        type: "PERCENTAGE",
        value: 50,
        minOrderAmount: 50000,
        usageLimit: 1,
        costPoints: 500,
        isActive: true,
      },
    }),
    prisma.promoCode.create({
      data: {
        code: "BONUS1000",
        type: "FIXED_AMOUNT",
        value: 1000,
        minOrderAmount: null,
        usageLimit: null,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${promoCodes.length} promo codes.\n`);

  // Create 50 Products with real images
  console.log("📦 Creating 50 products with real images...");
  const products = [];

  for (let i = 0; i < 50; i++) {
    const type = random(PRODUCT_TYPES);
    const brand = random(BRANDS);
    const style = random(STYLES);
    const category = random(categories);
    const productColors = randomSubset(COLORS, 2, 4);
    const productSizes = randomSubset(SIZES, 3, 5);

    const isNew = Math.random() > 0.7;
    const isPromotion = Math.random() > 0.75;
    const isBestSeller = Math.random() > 0.8;

    const basePrice = randomInt(25000, 180000);
    const oldPrice = isPromotion ? Math.round(basePrice * 1.25) : null;
    const mainRef = generateReference(brand, i);

    console.log(`   📦 [${i + 1}/50] ${brand} ${type} ${style}...`);

    // Get images for this product type
    const typeImages = PRODUCT_IMAGES[type] || PRODUCT_IMAGES["T-Shirt"];

    // Create image variants for each color
    const imagesData = [];
    for (let colorIdx = 0; colorIdx < productColors.length; colorIdx++) {
      const color = productColors[colorIdx];
      const colorRef = generateReference(brand, i, color);
      const imageUrl = typeImages[colorIdx % typeImages.length];
      const localPath = await downloadImage(
        imageUrl,
        `product-${type.toLowerCase()}`,
      );
      const colorPrice = basePrice + colorIdx * randomInt(1000, 3000);
      const stock = randomInt(10, 60);

      imagesData.push({
        url: localPath,
        reference: colorRef,
        color: color,
        sizes: productSizes,
        price: colorPrice,
        oldPrice: isPromotion ? Math.round(colorPrice * 1.25) : null,
        stock: stock,
        isNew: colorIdx === 0 && isNew,
        isBestSeller: colorIdx === 0 && isBestSeller,
        isPromotion: isPromotion,
        categoryId: category.id,
        promotionRuleId: isPromotion ? random(promos).id : null,
      });
    }

    const product = await prisma.product.create({
      data: {
        name: `${brand} ${type} ${style}`,
        description: `Découvrez notre ${brand} ${type} ${style} de la collection ${category.name}. Un incontournable de la marque ${brand}. Conçu pour allier style et confort.`,
        reference: mainRef,
        price: basePrice,
        stock: imagesData.reduce((sum, img) => sum + img.stock, 0),
        status: "PUBLISHED",
        categoryId: category.id,
        brand: brand,
        colors: productColors,
        sizes: productSizes,
        isNew: isNew,
        isPromotion: isPromotion,
        oldPrice: oldPrice,
        isBestSeller: isBestSeller,
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: randomInt(5, 100),
        promotionRuleId: isPromotion ? random(promos).id : null,
        images: { create: imagesData },
      },
      include: { images: true },
    });
    products.push(product);
  }
  console.log(`✅ Created ${products.length} products with images.\n`);

  // Create Stock Movements
  console.log("📊 Creating stock movements...");
  let stockCount = 0;
  for (const product of products) {
    for (const img of product.images) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          productImageId: img.id,
          type: "RECEIVED",
          quantity: img.stock || 0,
          previousStock: 0,
          newStock: img.stock || 0,
          reason: "Stock initial",
          note: `Lot initial - ${img.reference}`,
          createdBy: "admin@boutique.com",
        },
      });
      stockCount++;
    }
  }
  console.log(`✅ Created ${stockCount} stock movements.\n`);

  // Create Customers
  console.log("👥 Creating customers...");
  const customers = [];
  const customerPassword = await bcrypt.hash("client123", 10);

  const defaultClient = await prisma.user.create({
    data: {
      username: "Jean Dupont",
      email: "client@boutique.com",
      password: customerPassword,
      role: "CUSTOMER",
      isActive: true,
      points: 250, // Initial points for testing
    },
  });
  customers.push(defaultClient);

  for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
    const name = CUSTOMER_NAMES[i];
    const emailName = name
      .toLowerCase()
      .replace(" ", ".")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const photo = await downloadImage(
      CUSTOMER_PHOTOS[i % CUSTOMER_PHOTOS.length],
      "customer",
    );

    const customer = await prisma.user.create({
      data: {
        username: name,
        email: `${emailName}@example.com`,
        password: customerPassword,
        role: "CUSTOMER",
        isActive: true,
        photo: photo,
        points: randomInt(0, 500),
      },
    });
    customers.push(customer);
  }
  console.log(`✅ Created ${customers.length} customers.\n`);

  // Create Orders with productImageId
  console.log("🛒 Creating orders...");
  for (let i = 0; i < 80; i++) {
    const customer = random(customers);
    const daysAgo = randomInt(0, 60);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const numItems = randomInt(1, 4);
    const orderItemsData = [];
    let total = 0;

    for (let j = 0; j < numItems; j++) {
      const product = random(products);
      const productImage =
        product.images.length > 0 ? random(product.images) : null;
      const quantity = randomInt(1, 3);
      const price = productImage?.price || product.price;
      total += price * quantity;

      orderItemsData.push({
        productId: product.id,
        productImageId: productImage?.id || null,
        quantity,
        price,
      });
    }

    let status = "PENDING";
    if (daysAgo > 14) status = random(["DELIVERED", "COMPLETED"]);
    else if (daysAgo > 7) status = random(["SHIPPED", "DELIVERED"]);
    else if (daysAgo > 2) status = random(["PROCESSING", "SHIPPED"]);
    else status = random(["PENDING", "PROCESSING"]);

    if (Math.random() > 0.92) status = "CANCELLED";

    const reference = `CMD-${createdAt.getFullYear().toString().slice(-2)}${(createdAt.getMonth() + 1).toString().padStart(2, "0")}${createdAt.getDate().toString().padStart(2, "0")}-${(1000 + i).toString()}`;

    await prisma.order.create({
      data: {
        reference,
        total,
        status,
        stockReduced: status === "COMPLETED" || status === "DELIVERED",
        customer: { connect: { id: customer.id } },
        createdAt,
        updatedAt: createdAt,
        items: { create: orderItemsData },
        transactions: {
          create: [
            {
              amount: total,
              currency: "MGA",
              provider: random(["mvola", "cash", "stripe"]),
              status:
                status === "CANCELLED"
                  ? "FAILED"
                  : status === "PENDING"
                    ? "PENDING"
                    : "SUCCESS",
            },
          ],
        },
      },
    });
  }
  console.log("✅ Created 80 orders.\n");

  // Create Payment Methods
  console.log("💳 Creating payment methods...");
  await prisma.paymentMethod.createMany({
    data: [
      {
        code: "mvola",
        name: "MVola",
        description: "Paiement mobile via Telma MVola",
        isActive: true,
      },
      {
        code: "cash",
        name: "Paiement à la livraison",
        description: "Payer en espèces à la réception",
        isActive: true,
      },
      {
        code: "stripe",
        name: "Carte Bancaire",
        description: "Paiement sécurisé par carte",
        isActive: true,
        isDefault: true,
      },
    ],
  });
  console.log("✅ Created payment methods.\n");

  // Create Admin
  console.log("👤 Creating admin...");
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: "admin@boutique.com" },
  });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        name: "Super Admin",
        email: "admin@boutique.com",
        password: await bcrypt.hash("admin123", 10),
        role: "superadmin",
        isActive: true,
      },
    });
  }
  console.log("✅ Admin ready.\n");

  // Create Reviews
  console.log("💬 Creating reviews...");
  let reviewCount = 0;
  for (const product of products) {
    const numReviews = randomInt(2, 6);
    for (let j = 0; j < numReviews; j++) {
      await prisma.review.create({
        data: {
          rating: parseFloat((3 + Math.random() * 2).toFixed(1)),
          comment: random(REVIEW_COMMENTS),
          isVerified: Math.random() > 0.3,
          productId: product.id,
          userId: random(customers).id,
        },
      });
      reviewCount++;
    }

    const productReviews = await prisma.review.findMany({
      where: { productId: product.id },
    });
    const avgRating =
      productReviews.reduce((acc, r) => acc + r.rating, 0) /
      productReviews.length;
    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: productReviews.length,
      },
    });
  }
  console.log(`✅ Created ${reviewCount} reviews.\n`);

  console.log("🎉 Seeding finished successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Products: 50`);
  console.log(`   - Customers: ${customers.length}`);
  console.log(`   - Orders: 80`);
  console.log(`   - Reviews: ${reviewCount}`);
  console.log(`\n🔑 Logins:`);
  console.log(`   - Admin: admin@boutique.com / admin123`);
  console.log(`   - Client: client@boutique.com / client123`);
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
