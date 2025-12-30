import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ProductInfo {
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  price: number;
  colors: string[];
  sizes: string[];
}

interface GeneratedBlogContent {
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
}

/**
 * Generate blog content for a product using Gemini AI
 */
export async function generateBlogContent(
  product: ProductInfo,
): Promise<GeneratedBlogContent> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Tu es un rédacteur web expert spécialisé dans la mode et le lifestyle pour une boutique e-commerce malgache premium appelée "Boutique Diary".

Génère un article de blog COMPLET, PROFESSIONNEL et ENGAGEANT pour ce produit:

📦 **INFORMATIONS PRODUIT:**
- Nom: ${product.name}
- Description: ${product.description || "Non disponible"}
- Marque: ${product.brand || "Boutique Diary Exclusive"}
- Catégorie: ${product.category || "Mode & Style"}
- Prix: ${product.price.toLocaleString()} MGA
- Couleurs: ${product.colors.length > 0 ? product.colors.join(", ") : "Couleurs variées"}
- Tailles: ${product.sizes.length > 0 ? product.sizes.join(", ") : "Toutes tailles"}

📝 **STRUCTURE DE L'ARTICLE (600-800 mots):**

1. **Introduction captivante** (2-3 paragraphes)
   - Accroche émotionnelle sur le style/tendance
   - Présentation du produit comme solution

2. **Caractéristiques & Qualité** (2-3 paragraphes)
   - Détails des matériaux et de la confection
   - Pourquoi ce produit est spécial

3. **Comment le porter** (2-3 paragraphes)
   - Idées de looks et associations
   - Occasions (quotidien, soirée, travail, etc.)

4. **Conseils de style personnalisés** (1-2 paragraphes)
   - Tips pour différentes morphologies
   - Accessoires recommandés

5. **Conclusion avec call-to-action** (1 paragraphe)
   - Résumé des avantages
   - Invitation à découvrir le produit

📋 **FORMAT DE RÉPONSE (JSON strict):**

{
  "title": "Titre accrocheur et SEO-friendly de 50-70 caractères",
  "excerpt": "Description captivante et détaillée de 3-4 phrases qui résume l'article et donne envie de lire. Cette description doit faire entre 200 et 300 caractères et présenter les points clés du produit.",
  "content": "Article HTML complet avec: <h2> pour les sections principales, <h3> pour les sous-sections, <p> pour les paragraphes, <ul><li> pour les listes, <strong> pour les mots-clés importants. MINIMUM 600 mots.",
  "metaTitle": "Titre SEO optimisé avec mot-clé principal (50-60 caractères)",
  "metaDescription": "Description SEO engageante avec call-to-action (140-155 caractères)"
}

⚠️ IMPORTANT:
- Écris en français courant et élégant
- Utilise un ton chaleureux et professionnel
- L'article doit être COMPLET (600-800 mots minimum)
- Inclus des emojis subtils dans le contenu HTML pour dynamiser
- Réponds UNIQUEMENT avec le JSON valide, sans markdown`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = JSON.parse(text) as GeneratedBlogContent;

    return {
      title: parsed.title || `Découvrez ${product.name}`,
      excerpt:
        parsed.excerpt ||
        `Explorez notre ${product.name}, un incontournable de la collection.`,
      content: parsed.content || `<p>Article sur ${product.name}</p>`,
      metaTitle: parsed.metaTitle || parsed.title || product.name,
      metaDescription: parsed.metaDescription || parsed.excerpt || "",
    };
  } catch (error) {
    console.error("[Gemini] ERROR IN GENERATION:", error);
    if (error instanceof Error) {
      console.error("[Gemini] Error details:", error.message);
    }

    // Fallback content if Gemini fails
    return {
      title: `Découvrez ${product.name}`,
      excerpt: `Explorez notre ${product.name} de ${product.brand || "notre collection"}.`,
      content: `
        <h2>Présentation de ${product.name}</h2>
        <p>${product.description || "Un produit de qualité de notre collection."}</p>
        <h3>Caractéristiques</h3>
        <ul>
          <li><strong>Marque:</strong> ${product.brand || "Boutique Diary"}</li>
          <li><strong>Prix:</strong> ${product.price.toLocaleString()} MGA</li>
          ${product.colors.length > 0 ? `<li><strong>Couleurs:</strong> ${product.colors.join(", ")}</li>` : ""}
          ${product.sizes.length > 0 ? `<li><strong>Tailles:</strong> ${product.sizes.join(", ")}</li>` : ""}
        </ul>
        <h3>Pourquoi choisir ce produit?</h3>
        <p>Ce produit allie style et confort pour un look parfait au quotidien.</p>
      `,
      metaTitle: product.name,
      metaDescription: `Découvrez ${product.name} sur Boutique Diary.`,
    };
  }
}

/**
 * Generate a URL-safe slug from a title
 */
export function generateSlug(title: string): string {
  if (!title) return `post-${Date.now()}`;

  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") 
    .trim()
    .slice(0, 100); 

  if (slug.length < 2) {
    return `post-${Date.now()}`;
  }

  return slug;
}
