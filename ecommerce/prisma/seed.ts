import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { readdir } from "fs/promises";
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

const PRODUCTS_DIR = path.join(process.cwd(), "public/uploads/products");

// Estimation des prix en MGA par catégorie (Abordable Ar)
const PRICE_RANGES: Record<string, { min: number; max: number }> = {
  Femmes: { min: 25000, max: 95000 },
  Hommes: { min: 30000, max: 110000 },
  Enfants: { min: 15000, max: 65000 },
  Accessoires: { min: 5000, max: 55000 },
  default: { min: 20000, max: 80000 },
};

const BRANDS = [
  "Boutique Diary",
  "Zara",
  "H&M",
  "Shein",
  "Mango",
  "Nike",
  "Adidas",
  "Local",
];

const COLORS = [
  "Noir",
  "Blanc",
  "Rouge",
  "Bleu",
  "Vert",
  "Rose",
  "Beige",
  "Gris",
  "Marron",
];

const SIZES = ["S", "M", "L", "XL", "Unique"];

const CUSTOMER_NAMES = [
  "Rasoa Kely",
  "Rakoto Be",
  "Julie Randria",
  "Hery Nirina",
  "Mialy Rajo",
  "Soa Faniry",
  "Andry Lova",
  "Tiana Soa",
  "Faly Rado",
  "Nomena Fitia",
];

// ===========================================
// HELPERS
// ===========================================

const random = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomSubset = <T>(arr: T[], min = 1, max = 3): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(arr.length, randomInt(min, max)));
};

function generateReference(brand: string, id: number): string {
  const b = brand.replace(/\s/g, "").substring(0, 3).toUpperCase();
  return `${b}-${id.toString().padStart(4, "0")}`;
}

async function getCategoriesAndImages() {
  const categories = [];
  try {
    const mainCats = await readdir(PRODUCTS_DIR, { withFileTypes: true });

    for (const mainCat of mainCats) {
      if (mainCat.isDirectory()) {
        const catName = mainCat.name;
        const mainCatPath = path.join(PRODUCTS_DIR, catName);
        const subDirs = await readdir(mainCatPath, { withFileTypes: true });

        const products = [];
        for (const subDir of subDirs) {
          if (subDir.isDirectory()) {
            const subDirName = subDir.name;
            const subDirPath = path.join(mainCatPath, subDirName);
            const files = await readdir(subDirPath);
            const images = files
              .filter(f => /\.(jpg|jpeg|png|webp|jfif)$/i.test(f))
              .map(f => `/uploads/products/${catName}/${subDirName}/${f}`);

            if (images.length > 0) {
              products.push({
                name: subDirName,
                images,
                isPromotion: catName === "Promotions",
              });
            }
          }
        }

        if (products.length > 0) {
          categories.push({
            name: catName,
            slug: catName.toLowerCase(),
            products,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error reading products directory:", error);
  }
  return categories;
}

// ===========================================
// MAIN
// ===========================================

async function main() {
  console.log("🚀 Starting seeding with your custom images...");

  // Clean DB
  console.log("Cleaning database...");
  await prisma.storeTheme.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.address.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.reviewReaction.deleteMany();
  await prisma.reviewReply.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany({
    where: { NOT: { email: "admin@boutique.com" } },
  });

  const catData = await getCategoriesAndImages();
  if (catData.length === 0) {
    console.error("❌ No images found in public/uploads/products/");
    console.log(
      "Make sure folders Femmes, Hommes, Enfants, Accessoires exist.",
    );
    return;
  }

  // Admin & User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const clientPassword = await bcrypt.hash("client123", 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@boutique.com" },
    update: {},
    create: {
      name: "Admin Principal",
      email: "admin@boutique.com",
      password: hashedPassword,
      role: "superadmin",
      isActive: true,
    },
  });
  console.log("👤 Admin created/updated.");

  const users = [];
  for (const name of CUSTOMER_NAMES) {
    const email = `${name.toLowerCase().replace(/\s/g, ".")}@gmail.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        username: name,
        email,
        password: clientPassword,
        role: "CUSTOMER",
        points: randomInt(0, 500),
      },
    });

    // Add address for each user
    await prisma.address.create({
      data: {
        userId: user.id,
        street: `${randomInt(1, 100)} Rue de l'Indépendance`,
        city: "Antananarivo",
        postalCode: "101",
        country: "Madagascar",
        phoneNumber: "+261 34 00 000 00",
        isDefault: true,
        label: "Domicile",
      },
    });

    users.push(user);
  }
  console.log(`👥 ${users.length} users created with addresses.`);

  // Site Settings
  await prisma.siteSettings.createMany({
    data: [
      { key: "store_name", value: "Boutique Diary" },
      { key: "contact_email", value: "contact@boutique-diary.mg" },
      { key: "currency", value: "MGA" },
      { key: "loyalty_points_ratio", value: "0.01" }, // 1 point per 100 MGA
    ],
  });

  // Store Theme
  await prisma.storeTheme.create({
    data: {
      name: "Default Modern",
      primaryColor: "#3d6b6b",
      secondaryColor: "#d4b8a5",
      accentColor: "#c45a4a",
      stylePreset: "material",
      isActive: true,
    },
  });

  // Banners
  await prisma.banner.createMany({
    data: [
      {
        title: "Nouvelle Collection Femme",
        subtitle: "Élégance & Style",
        description: "Découvrez les dernières tendances de cette saison.",
        buttonText: "Acheter Maintenant",
        buttonLink: "/shop?category=femmes",
        imageUrl: "/images/banner-femme.jpg",
        order: 1,
      },
      {
        title: "Mode Homme 2024",
        subtitle: "Confort & Distinction",
        description: "Une sélection exclusive pour l'homme moderne.",
        buttonText: "Voir la Collection",
        buttonLink: "/shop?category=hommes",
        imageUrl: "/images/Banner-homme.jpg",
        order: 2,
      },
      {
        title: "Spécial Enfants",
        subtitle: "Couleurs & Joie",
        description: "Des vêtements confortables pour vos petits aventuriers.",
        buttonText: "Découvrir",
        buttonLink: "/shop?category=enfants",
        imageUrl: "/images/banner-enfant.jpg",
        order: 3,
      },
    ],
  });
  console.log("🖼️ Banners created.");

  // Create Categories & Products
  let productCount = 0;
  const allProducts = [];

  for (const cat of catData) {
    let categoryName = cat.name;
    if (categoryName === "Promotions") categoryName = "Accessoires";

    const category = await prisma.category.upsert({
      where: { slug: categoryName.toLowerCase() },
      update: {},
      create: {
        name: categoryName,
        slug: categoryName.toLowerCase(),
        description: `Collection ${categoryName}`,
      },
    });

    const priceRange = PRICE_RANGES[categoryName] || PRICE_RANGES.default;

    for (const prod of cat.products) {
      const isPromo = prod.isPromotion;
      const brand = random(BRANDS);

      let price = randomInt(priceRange.min, priceRange.max);
      if (isPromo) price = Math.floor(price * 0.7);

      const finalPrice = Math.ceil(price / 100) * 100;
      const oldPrice = isPromo ? Math.ceil(finalPrice / 0.7 / 100) * 100 : null;

      const productColors = randomSubset(COLORS, 2, 5);
      const productSizes = randomSubset(SIZES, 2, 4);
      const mainRef = generateReference(brand, productCount);

      const pName = prod.name
        .replace(/-/g, " ")
        .replace(/\b\w/g, l => l.toUpperCase());

      const imagesData = prod.images.map((imgPath: string, idx: number) => {
        const color = productColors[idx % productColors.length];
        return {
          url: imgPath,
          reference: `${mainRef}-IMG${idx + 1}`,
          stock: randomInt(10, 100),
          price: finalPrice,
          color: color,
        };
      });

      const product = await prisma.product.create({
        data: {
          name: pName,
          description: `Découvrez notre ${pName} de la marque ${brand}. Nouveau style disponible en plusieurs coloris.`,
          price: finalPrice,
          oldPrice: oldPrice,
          brand,
          reference: mainRef,
          status: "PUBLISHED",
          categoryId: category.id,
          stock: imagesData.reduce(
            (acc: number, img: any) => acc + img.stock,
            0,
          ),
          colors: productColors,
          sizes: productSizes,
          isNew: !isPromo && Math.random() > 0.5,
          isPromotion: isPromo,
          isBestSeller: Math.random() > 0.7,
          rating: parseFloat((4.0 + Math.random()).toFixed(1)),
          reviewCount: randomInt(5, 45),
          images: {
            create: imagesData,
          },
        },
        include: { images: true },
      });
      allProducts.push(product);
      productCount++;
    }
  }

  console.log(`📦 Created ${productCount} products.`);

  // Blog Posts
  console.log("✍️ Creating blog posts...");
  for (let i = 0; i < 3; i++) {
    const product = allProducts[i % allProducts.length];
    await prisma.blogPost.create({
      data: {
        title: `Comment porter votre ${product.name} ?`,
        slug: `comment-porter-votre-${product.name.toLowerCase().replace(/\s/g, "-")}-${i}`,
        content: `Ceci est un article de blog détaillé sur la façon d'accessoiriser votre ${product.name}. La mode à Madagascar évolue et Boutique Diary vous accompagne.`,
        excerpt: `Découvrez nos conseils mode pour sublimer votre ${product.name}.`,
        isPublished: true,
        publishedAt: new Date(),
        productId: product.id,
        coverImage: product.images[0]?.url,
      },
    });
  }

  // Promo Codes
  console.log("🎫 Creating promo codes...");
  await prisma.promoCode.createMany({
    data: [
      {
        code: "BIENVENUE10",
        type: "PERCENTAGE",
        value: 10,
        isActive: true,
        status: "ACTIVE",
      },
      {
        code: "KADOA5000",
        type: "FIXED_AMOUNT",
        value: 5000,
        isActive: true,
        status: "ACTIVE",
      },
    ],
  });

  // Create Stock Movements
  for (const prod of allProducts) {
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        type: "RECEIVED",
        quantity: prod.stock,
        previousStock: 0,
        newStock: prod.stock,
        reason: "Import initial des stocks",
        createdBy: admin.email,
      },
    });
  }

  // Create Fake Reviews (Testimonials)
  console.log("⭐ Creating testimonials (reviews)...");
  const reviewComments = [
    "La qualité est incroyable, je ne m'attendais pas à ça pour le prix !",
    "Service client au top et livraison rapide à Tana.",
    "Boutique très sérieuse, les habits sont magnifiques.",
    "J'adore ma nouvelle robe, elle taille parfaitement.",
    "Vraiment satisfaite de mes achats, je reviendrai bientôt !",
    "Les accessoires sont trop mignons, merci Diary !",
  ];

  for (let i = 0; i < reviewComments.length; i++) {
    const user = users[i % users.length];
    const product = allProducts[randomInt(0, allProducts.length - 1)];

    await prisma.review.create({
      data: {
        rating: randomInt(4, 5),
        comment: reviewComments[i],
        isVerified: true,
        productId: product.id,
        userId: user.id,
      },
    });
  }

  // Create Fake Orders
  console.log("🛒 Creating 100 fresh orders (with loyal customers)...");
  for (let i = 0; i < 100; i++) {
    // Utiliser une probabilité pour sélectionner certains clients plus souvent (fidélité)
    const loyalUser = users[i % 5]; // Les 5 premiers clients seront très fidèles
    const otherUser = random(users);
    const user = Math.random() > 0.4 ? loyalUser : otherUser;

    const numItems = randomInt(1, 4);
    const orderItems = [];
    let total = 0;

    for (let j = 0; j < numItems; j++) {
      const prod = random(allProducts);
      const qty = randomInt(1, 2);
      orderItems.push({
        productId: prod.id,
        quantity: qty,
        price: prod.price,
      });
      total += prod.price * qty;
    }

    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - randomInt(0, 45));

    await prisma.order.create({
      data: {
        reference: `CMD-${orderDate.getTime().toString().slice(-6)}-${randomInt(100, 999)}-${i}`,
        total,
        status: random([
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "COMPLETED",
          "PENDING",
          "CANCELLED",
        ]),
        customerId: user.id,
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: orderItems,
        },
        transactions: {
          create: {
            amount: total,
            currency: "MGA",
            provider: random(["MVola", "Orange Money", "Airtel Money", "Cash"]),
            status: Math.random() > 0.1 ? "SUCCESS" : "PENDING",
          },
        },
      },
    });
  }

  // Payment Methods
  console.log("💳 Creating payment methods...");
  await prisma.paymentMethod.deleteMany();
  await prisma.paymentMethod.createMany({
    data: [
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
    ],
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
