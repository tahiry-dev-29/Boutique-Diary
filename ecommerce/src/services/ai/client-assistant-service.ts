import {
  GoogleGenerativeAI,
  Tool,
  SchemaType,
  Content,
} from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Tool definitions for Gemini Client Assistant
const clientTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "search_products",
        description:
          "Rechercher des produits par nom, catégorie ou description.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description:
                "Le terme de recherche (ex: 'robe', 'homme', 'nouveautés').",
            },
            category: {
              type: SchemaType.STRING,
              description: "Filtrer par nom de catégorie.",
            },
            limit: {
              type: SchemaType.NUMBER,
              description: "Nombre maximum de résultats (par défaut 5).",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_product_details",
        description: "Obtenir les détails complets d'un produit spécifique.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            productId: {
              type: SchemaType.NUMBER,
              description: "L'ID du produit.",
            },
          },
          required: ["productId"],
        },
      },
      {
        name: "get_new_arrivals",
        description: "Obtenir les derniers produits ajoutés à la boutique.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            limit: {
              type: SchemaType.NUMBER,
              description: "Nombre de produits à retourner (par défaut 4).",
            },
          },
        },
      },
      {
        name: "get_promotions",
        description: "Obtenir la liste des produits en promotion actuellement.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            limit: {
              type: SchemaType.NUMBER,
              description: "Nombre de produits à retourner (par défaut 4).",
            },
          },
        },
      },
      {
        name: "search_blog_posts",
        description:
          "Rechercher des articles de blog sur la mode ou des conseils.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description: "Le terme de recherche pour le blog.",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_shop_info",
        description:
          "Obtenir des informations sur la boutique (contact, livraison, horaires).",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {},
        },
      },
    ],
  },
];

export class ClientAssistantService {
  private static readonly MODEL_NAME = "gemini-2.5-flash";

  static async handleRequest(message: string, history: Content[] = []) {
    const model = genAI.getGenerativeModel({
      model: this.MODEL_NAME,
      tools: clientTools,
      systemInstruction: `Vous êtes l'Assistant IA de Boutique Diary, une boutique de mode en ligne à Madagascar.
      Votre rôle est d'aider les clients à trouver des produits, les conseiller sur la mode, et répondre à leurs questions sur la boutique.
      Soyez chaleureux, accueillant, et professionnel. Utilisez un ton amical.
      Vous avez accès à des outils pour rechercher des produits, des articles de blog et des informations sur la boutique.
      Si vous ne trouvez pas un produit spécifique, proposez des alternatives similaires.
      N'inventez pas de prix ou de stocks s'ils ne sont pas fournis par les outils.
      Répondez en français.`,
    });

    const cleanedHistory: Content[] = (history || []).map(h => {
      const isFunctionRole = h.role === "function";
      return {
        role:
          h.role === "system"
            ? "user"
            : (h.role as "user" | "model" | "function"),
        parts: h.parts.map(p => {
          if (p.functionCall) return { functionCall: p.functionCall };
          if (p.functionResponse)
            return { functionResponse: p.functionResponse };
          return { text: p.text || (isFunctionRole ? "" : " ") };
        }),
      };
    });

    let startIndex = 0;
    while (
      startIndex < cleanedHistory.length &&
      cleanedHistory[startIndex].role === "model"
    ) {
      startIndex++;
    }

    const chat = model.startChat({
      history: cleanedHistory.slice(startIndex),
    });

    // Helper for retry
    const withRetry = async <T>(
      fn: () => Promise<T>,
      retries = 3,
      delay = 2000,
    ): Promise<T> => {
      try {
        return await fn();
      } catch (error: unknown) {
        const err = error as { status?: number };
        if (err.status === 429 && retries > 0) {
          console.warn(`[ClientAI] Rate limited. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return withRetry(fn, retries - 1, delay * 2);
        }
        throw error;
      }
    };

    try {
      let result = await withRetry(() => chat.sendMessage(message));
      let response = result.response;

      const calls = response.functionCalls();
      if (calls && calls.length > 0) {
        const toolResponses: Array<{
          functionResponse: { name: string; response: object };
        }> = [];

        for (const call of calls) {
          const { name, args } = call;
          const toolArgs = args as Record<string, unknown>;
          console.log(`[ClientAI] Calling tool: ${name}`, toolArgs);

          let toolResult;
          switch (name) {
            case "search_products":
              toolResult = await this.searchProducts(
                toolArgs.query as string,
                toolArgs.category as string | undefined,
                (toolArgs.limit as number) || 5,
              );
              break;
            case "get_product_details":
              toolResult = await this.getProductDetails(
                Number(toolArgs.productId),
              );
              break;
            case "get_new_arrivals":
              toolResult = await this.getNewArrivals(
                (toolArgs.limit as number) || 4,
              );
              break;
            case "get_promotions":
              toolResult = await this.getPromotions(
                (toolArgs.limit as number) || 4,
              );
              break;
            case "search_blog_posts":
              toolResult = await this.searchBlogPosts(toolArgs.query as string);
              break;
            case "get_shop_info":
              toolResult = await this.getShopInfo();
              break;
            default:
              toolResult = { error: "Outil non trouvé" };
          }

          toolResponses.push({
            functionResponse: {
              name,
              response: toolResult as object,
            },
          });
        }

        result = await withRetry(() => chat.sendMessage(toolResponses));
        response = result.response;
      }

      const responseText = response.text();
      return {
        text: responseText,
        history: await chat.getHistory(),
      };
    } catch (error) {
      console.error("[ClientAI] Error:", error);
      throw error;
    }
  }

  // --- Tool Implementations ---

  private static async searchProducts(
    query: string,
    categoryName?: string,
    limit: number = 5,
  ) {
    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { reference: { contains: query, mode: "insensitive" } },
      ],
    };

    if (categoryName) {
      where.category = {
        name: { contains: categoryName, mode: "insensitive" },
      };
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        reference: true,
        isPromotion: true,
        oldPrice: true,
        category: { select: { name: true } },
      },
      take: limit,
    });

    return { products };
  }

  private static async getProductDetails(productId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: { select: { url: true } },
      },
    });
    return product;
  }

  private static async getNewArrivals(limit: number) {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, name: true, price: true, reference: true },
    });
    return { products };
  }

  private static async getPromotions(limit: number) {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED", deletedAt: null, isPromotion: true },
      take: limit,
      select: { id: true, name: true, price: true, oldPrice: true },
    });
    return { products };
  }

  private static async searchBlogPosts(query: string) {
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, slug: true, excerpt: true },
      take: 3,
    });
    return { posts };
  }

  private static async getShopInfo() {
    const settings = await prisma.siteSettings.findMany();
    const info: Record<string, string> = {};
    settings.forEach(s => {
      info[s.key] = s.value;
    });
    return {
      name: "Boutique Diary",
      location: "Antananarivo, Madagascar",
      contact: info,
      delivery:
        "Livraison partout à Madagascar via colissimo ou transporteurs locaux.",
    };
  }
}
