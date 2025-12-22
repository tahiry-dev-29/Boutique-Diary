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

// Real product images from Unsplash (fashion/clothing)
const PRODUCT_IMAGES = {
  "T-Shirt": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
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

// Customer names for realistic data (excluding "Jean Dupont" which is the default client)
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
  "Manon Simon",
  "Nathan Laurent",
  "Camille Lefebvre",
  "Jules Michel",
  "Zoé Garcia",
  "Théo David",
  "Charlotte Bertrand",
  "Mathis Roux",
  "Inès Vincent",
];

// Helper functions
const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomSubset = <T>(arr: T[], min = 1, max = 3): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * (max - min + 1)) + min);
};

async function main() {
  console.log("🚀 Starting seeding...\n");

  // Clean DB
  try {
    console.log("🧹 Cleaning database...");
    await prisma.stockMovement.deleteMany();
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariation.deleteMany();
    await prisma.product.deleteMany();
    await prisma.promoCode.deleteMany();
    await prisma.promotionRule.deleteMany();
    await prisma.paymentTransaction.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany(); // Delete ALL users
    console.log("✅ Database cleaned.\n");
  } catch (error) {
    console.warn("⚠️ Error cleaning database:", error);
  }

  // Create Categories
  console.log("📁 Creating categories...");
  const categories = [];
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({ data: cat });
    categories.push(created);
  }
  console.log(`✅ Created ${categories.length} categories.\n`);

  // Create Promotion Rules
  console.log("🏷️ Creating promotion rules...");
  const promotions = [];

  const summerSale = await prisma.promotionRule.create({
    data: {
      name: "Soldes d'été -20%",
      priority: 1,
      conditions: { type: "cart_total_gt", value: 50 },
      actions: { type: "discount_percentage", value: 20 },
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-08-31"),
      isActive: true,
    },
  });
  promotions.push(summerSale);

  const flashSale = await prisma.promotionRule.create({
    data: {
      name: "Flash Sale -30%",
      priority: 2,
      conditions: { type: "product_category", value: "sport" },
      actions: { type: "discount_percentage", value: 30 },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
    },
  });
  promotions.push(flashSale);

  const newCustomer = await prisma.promotionRule.create({
    data: {
      name: "Nouveau client -15%",
      priority: 0,
      conditions: { type: "first_order", value: true },
      actions: { type: "discount_percentage", value: 15 },
      isActive: true,
    },
  });
  promotions.push(newCustomer);
  console.log(`✅ Created ${promotions.length} promotion rules.\n`);

  // Create Promo Codes
  console.log("🎫 Creating promo codes...");
  await prisma.promoCode.createMany({
    data: [
      {
        code: "WELCOME10",
        type: "PERCENTAGE",
        value: 10,
        usageLimit: 100,
        usageCount: 23,
        minOrderAmount: 30,
        isActive: true,
      },
      {
        code: "SUMMER25",
        type: "PERCENTAGE",
        value: 25,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-08-31"),
        usageLimit: 500,
        usageCount: 142,
        isActive: true,
      },
      {
        code: "FREESHIP",
        type: "FIXED_AMOUNT",
        value: 15000, // Free shipping value in MGA
        usageLimit: 200,
        usageCount: 67,
        minOrderAmount: 100000,
        isActive: true,
      },
      {
        code: "VIP50",
        type: "PERCENTAGE",
        value: 50,
        usageLimit: 10,
        usageCount: 8,
        minOrderAmount: 200000,
        isActive: true,
      },
    ],
  });
  console.log("✅ Created 4 promo codes.\n");

  // Create Products with real images
  console.log("📦 Creating products...");
  const products = [];
  for (let i = 0; i < 50; i++) {
    const category = random(categories);
    const brand = random(BRANDS);
    const productColors = randomSubset(COLORS, 2, 4);
    const productSizes = randomSubset(SIZES, 3, 5);
    const isNew = Math.random() > 0.75;
    const isPromotion = Math.random() > 0.8;
    const isBestSeller = Math.random() > 0.85;
    const type = random(PRODUCT_TYPES);
    const style = random(STYLES);

    const name = `${brand} ${type} ${style}`;
    const basePrice = parseFloat((Math.random() * 150000 + 20000).toFixed(0)); // Price in MGA
    const oldPrice = isPromotion
      ? parseFloat((basePrice * (1 + Math.random() * 0.3)).toFixed(0))
      : null;

    // Get real images for product type
    const typeImages =
      PRODUCT_IMAGES[type as keyof typeof PRODUCT_IMAGES] ||
      PRODUCT_IMAGES["T-Shirt"];
    const mainImageUrl = random(typeImages);

    const imagesData: Array<{
      url: string;
      reference: string;
      color: string | null;
      sizes: string[];
      price: number;
      oldPrice: number | null;
      stock: number;
      isNew: boolean;
      isBestSeller: boolean;
      isPromotion: boolean;
      categoryId: number;
      promotionRuleId: number | null;
    }> = [
      {
        url: mainImageUrl,
        reference: `${brand.substring(0, 2).toUpperCase()}${i.toString().padStart(4, "0")}`,
        color: null,
        sizes: productSizes,
        price: basePrice,
        oldPrice,
        stock: Math.floor(Math.random() * 50) + 5,
        isNew,
        isBestSeller,
        isPromotion,
        categoryId: category.id,
        promotionRuleId: isPromotion ? random(promotions).id : null,
      },
    ];

    // Color variations with different images
    for (const color of productColors.slice(0, 2)) {
      const colorImage = random(typeImages);
      imagesData.push({
        url: colorImage,
        reference: `${brand.substring(0, 2).toUpperCase()}${i.toString().padStart(4, "0")}-${color.substring(0, 2).toUpperCase()}`,
        color,
        sizes: productSizes,
        price: basePrice + Math.floor(Math.random() * 5000),
        oldPrice: isPromotion ? oldPrice : null,
        stock: Math.floor(Math.random() * 30) + 3,
        isNew: false,
        isBestSeller: false,
        isPromotion,
        categoryId: category.id,
        promotionRuleId: null,
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: `Découvrez notre ${name} de la collection ${category.name}. Un incontournable de la marque ${brand}. Conçu pour allier style et confort, ce modèle ${style.toLowerCase()} saura vous séduire. Matière premium, coupe moderne.`,
        reference: `REF-${brand.substring(0, 2).toUpperCase()}${i.toString().padStart(5, "0")}`,
        price: basePrice,
        stock: Math.floor(Math.random() * 100) + 10,
        status: Math.random() > 0.1 ? "PUBLISHED" : "DRAFT",
        categoryId: category.id,
        brand,
        colors: productColors,
        sizes: productSizes,
        isNew,
        isPromotion,
        oldPrice,
        isBestSeller,
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 150),
        promotionRuleId: isPromotion ? random(promotions).id : null,
        images: {
          create: imagesData,
        },
      },
    });
    products.push(product);
  }
  console.log(`✅ Created ${products.length} products with real images.\n`);

  // Create Stock Movements
  console.log("📊 Creating stock movements...");
  let stockMovementCount = 0;
  for (const product of products.slice(0, 30)) {
    const numMovements = Math.floor(Math.random() * 5) + 2;

    for (let j = 0; j < numMovements; j++) {
      const isIncoming = Math.random() > 0.3;
      const quantity = Math.floor(Math.random() * 20) + 1;
      const previousStock = Math.floor(Math.random() * 50) + 10;
      const newStock = isIncoming
        ? previousStock + quantity
        : Math.max(0, previousStock - quantity);

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: isIncoming
            ? "RECEIVED"
            : random(["ORDER", "ADJUSTMENT", "RETURN"]),
          quantity: isIncoming ? quantity : -quantity,
          previousStock,
          newStock,
          reason: isIncoming
            ? random([
                "Réapprovisionnement",
                "Retour fournisseur",
                "Nouveau stock",
              ])
            : random(["Vente", "Retour client", "Inventaire", "Défectueux"]),
          note:
            Math.random() > 0.7
              ? `Mouvement de stock #${stockMovementCount + 1}`
              : null,
          createdBy: "admin@boutique.com",
          createdAt,
        },
      });
      stockMovementCount++;
    }
  }
  console.log(`✅ Created ${stockMovementCount} stock movements.\n`);

  // Create Customers
  console.log("👥 Creating customers...");
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

  // Random customers with real names
  for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
    const name = CUSTOMER_NAMES[i];
    const emailName = name
      .toLowerCase()
      .replace(" ", ".")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90));

    const customer = await prisma.user.create({
      data: {
        username: name,
        email: `${emailName}@example.com`,
        password: customerPassword,
        role: "CUSTOMER",
        isActive: true,
        createdAt,
      },
    });
    customers.push(customer);
  }
  console.log(`✅ Created ${customers.length} customers.\n`);

  // Create Orders
  console.log("🛒 Creating orders...");
  const ORDER_STATUSES = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
  ];

  for (let i = 0; i < 150; i++) {
    const customer = random(customers);
    const isToday = Math.random() > 0.7;
    const daysAgo = isToday ? 0 : Math.floor(Math.random() * 60) + 1;

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
    );

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

    // Determine status based on age
    let status = "PENDING";
    if (isToday) {
      status = random(["PENDING", "PROCESSING"]);
    } else if (daysAgo > 14) {
      status = random(["DELIVERED", "COMPLETED"]);
    } else if (daysAgo > 7) {
      status = random(["SHIPPED", "DELIVERED", "COMPLETED"]);
    } else {
      status = random(ORDER_STATUSES.filter(s => s !== "CANCELLED"));
    }

    // Some cancellations (10%)
    if (Math.random() > 0.9) status = "CANCELLED";

    await prisma.order.create({
      data: {
        reference: `${createdAt.getFullYear()}${(createdAt.getMonth() + 1).toString().padStart(2, "0")}${createdAt.getDate().toString().padStart(2, "0")}-${(1000 + i).toString()}`,
        total: parseFloat(total.toFixed(2)),
        status,
        customer: { connect: { id: customer.id } },
        createdAt,
        updatedAt: createdAt,
        items: {
          create: orderItemsData,
        },
        transactions: {
          create:
            Math.random() > 0.2
              ? [
                  {
                    amount: parseFloat(total.toFixed(2)),
                    currency: "MGA",
                    provider: random(["mvola", "stripe", "cash"]),
                    reference:
                      Math.random() > 0.5
                        ? `TXN-${Math.floor(Math.random() * 1000000)}`
                        : null,
                    status:
                      status === "PENDING"
                        ? "PENDING"
                        : status === "CANCELLED"
                          ? "FAILED"
                          : "SUCCESS",
                  },
                ]
              : [],
        },
      },
    });
  }
  console.log("✅ Created 150 orders with items and transactions.\n");

  // Create Payment Methods
  console.log("💳 Creating payment methods...");
  const paymentMethods = [
    {
      code: "mvola",
      name: "MVola",
      description: "Paiement mobile via Telma MVola",
      isActive: true,
      logoUrl: "/icons/mvola.png",
      config: {
        merchantName: "Boutique Diary",
        merchantNumber: "0340000000",
      },
    },
    {
      code: "orange_money",
      name: "Orange Money",
      description: "Paiement mobile via Orange Money",
      isActive: false,
      logoUrl: "/icons/orange_money.png",
    },
    {
      code: "stripe",
      name: "Carte Bancaire (Stripe)",
      description: "Paiement sécurisé par carte bancaire",
      isActive: true,
      isDefault: true,
      logoUrl: "/icons/stripe.png",
    },
    {
      code: "cash",
      name: "Paiement à la livraison",
      description: "Payer en espèces à la réception",
      isActive: true,
      logoUrl: "/icons/cash.png",
    },
  ];

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: method.code },
      update: {},
      create: method,
    });
  }
  console.log(`✅ Created ${paymentMethods.length} payment methods.\n`);

  // Create default admin in ADMIN table
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
    console.log("👤 Created admin: admin@boutique.com / admin123\n");
  } else {
    console.log("👤 Admin already exists.\n");
  }

  // Create Reviews
  console.log("💬 Creating reviews...");
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

  let reviewCount = 0;
  for (const product of products) {
    const numReviews = Math.floor(Math.random() * 5) + 1; // 1 to 5 reviews per product

    for (let j = 0; j < numReviews; j++) {
      const customer = random(customers);
      await prisma.review.create({
        data: {
          rating: parseFloat((3 + Math.random() * 2).toFixed(1)), // 3.0 to 5.0
          comment: random(REVIEW_COMMENTS),
          isVerified: Math.random() > 0.3,
          productId: product.id,
          userId: customer.id,
        },
      });
      reviewCount++;
    }

    // Update product average rating and count
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
  console.log(
    `✅ Created ${reviewCount} reviews for ${products.length} products.\n`,
  );

  console.log("🎉 Seeding finished successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Customers: ${customers.length}`);
  console.log(`   - Orders: 150`);
  console.log(`   - Stock Movements: ${stockMovementCount}`);
  console.log(`   - Promotions: ${promotions.length}`);
  console.log(`   - Promo Codes: 4`);
  console.log(`   - Reviews: ${reviewCount}`);
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
