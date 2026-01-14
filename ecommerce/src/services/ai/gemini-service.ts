import { GoogleGenerativeAI } from "@google/generative-ai";
import { BlogSchema, ProductInfo } from "./gemini-schemas";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Retry config for free tier rate limiting
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 5000, // 5 seconds
  maxDelayMs: 30000, // 30 seconds max
};

/**
 * Delay helper
 */
const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper with exponential backoff for rate limiting
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  context: string,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;

      // Check if it's a rate limit error (429)
      const isRateLimited =
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 429;

      if (!isRateLimited || attempt === RETRY_CONFIG.maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelayMs,
      );

      console.warn(
        `[Gemini] Rate limited on ${context}. Retry ${attempt + 1}/${RETRY_CONFIG.maxRetries} in ${delayMs / 1000}s...`,
      );

      await delay(delayMs);
    }
  }

  throw lastError;
}

/**
 * Professional service for AI content generation
 */
export class GeminiService {
  // Using gemini-2.5-flash - balanced model for text generation
  private static readonly MODEL_NAME = "gemini-2.5-flash";

  /**
   * Generates long-form SEO blog posts
   */
  static async generateBlog(product: ProductInfo) {
    const model = genAI.getGenerativeModel({
      model: this.MODEL_NAME,
      // Separate instructions from the prompt for better adherence
      systemInstruction:
        "You are an expert fashion copywriter for 'Boutique Diary', a premium store in Madagascar. You write in elegant French.",
      generationConfig: {
        responseMimeType: "application/json",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responseSchema: BlogSchema as any,
      },
    });

    const prompt = `Generate a professional blog post for: ${product.name}. 
    Brand: ${product.brand}. 
    Price: ${product.price} MGA. 
    Category: ${product.category}.
    Description: ${product.description}.
    Colors: ${product.colors.join(", ")}.
    Sizes: ${product.sizes.join(", ")}.
    Ensure the content is at least 600 words with HTML tags (h2, h3, p, strong, ul).`;

    try {
      return await withRetry(async () => {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
      }, "generateBlog");
    } catch (error) {
      return this.handleError(error, product);
    }
  }

  /**
   * Fast product description generation
   */
  static async generateQuickDescription(product: ProductInfo): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: this.MODEL_NAME,
      systemInstruction:
        "You are an expert e-commerce copywriter. Write short, persuasive product descriptions in plain text (NO HTML). Tone: Elegant, professional, persuasive. Language: French.",
    });

    const prompt = `Describe: ${product.name} (${product.brand || "Boutique Diary"}). 
    Category: ${product.category || "Mode"}.
    Focus on benefits, style, and quality. Length: 100-150 words.`;

    try {
      return await withRetry(async () => {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      }, "generateQuickDescription");
    } catch (error) {
      console.error("[Gemini] Description generation error:", error);
      return `Découvrez notre superbe ${product.name}, une pièce essentielle de la collection ${product.brand || "Boutique Diary"}. Alliant style et confort, ce produit saura vous séduire par sa qualité.`;
    }
  }

  /**
   * Technical prompt engineering for image AI
   */
  static async generateImagePrompt(product: ProductInfo): Promise<string> {
    const model = genAI.getGenerativeModel({ model: this.MODEL_NAME });

    const prompt = `Create a highly detailed English image prompt for ${product.name} (${product.brand}). 
    Category: ${product.category}. 
    Context: ${product.description}.
    Include: professional studio lighting, 8k resolution, minimalist background, cinematic lighting, photorealistic, best angle. 
    Output only the prompt text.`;

    try {
      return await withRetry(async () => {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      }, "generateImagePrompt");
    } catch (error) {
      console.error("[Gemini] Image prompt generation error:", error);
      return `Professional studio photography of ${product.name}, minimal elegance, high resolution, 8k, cinematic lighting, photorealistic`;
    }
  }

  private static handleError(error: unknown, product: ProductInfo) {
    console.error("[Gemini 2026] Generation failed:", error);
    // Return a safe fallback object following the same interface
    return {
      title: `Focus sur ${product.name}`,
      excerpt: "Découvrez l'élégance signée Boutique Diary.",
      content: `<p>Détails à venir pour ${product.name}.</p>`,
      metaTitle: product.name,
      metaDescription: "Article mode Boutique Diary.",
    };
  }

  /**
   * Generate actual image using Gemini Image model via REST API
   * Returns base64 image data
   */
  static async generateImage(
    prompt: string,
  ): Promise<{ base64: string; mimeType: string } | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Gemini] Missing API key");
      return null;
    }

    // Use gemini-2.5-flash-image (Nano Banana) for high-efficiency image generation
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Generate a professional product image: ${prompt}. 
              Style: Clean e-commerce product photography, white background, professional studio lighting, high resolution, no text overlay.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    try {
      return await withRetry(async () => {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[Gemini] API error:", errorData);
          throw { status: response.status, ...errorData };
        }

        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts || [];

        for (const part of parts) {
          if (part.inlineData?.data) {
            return {
              base64: part.inlineData.data,
              mimeType: part.inlineData.mimeType || "image/png",
            };
          }
        }

        console.warn("[Gemini] No image data in response");
        return null;
      }, "generateImage");
    } catch (error) {
      console.error("[Gemini] Image generation error:", error);
      return null;
    }
  }
}
