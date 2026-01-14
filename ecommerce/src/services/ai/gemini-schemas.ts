import { SchemaType } from "@google/generative-ai";

export const BlogSchema = {
  description: "Product blog content schema",
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: "SEO friendly title 50-70 chars",
    },
    excerpt: {
      type: SchemaType.STRING,
      description: "Detailed summary 200-300 chars",
    },
    content: {
      type: SchemaType.STRING,
      description: "Full HTML content, min 600 words",
    },
    metaTitle: { type: SchemaType.STRING },
    metaDescription: { type: SchemaType.STRING },
  },
  required: ["title", "excerpt", "content", "metaTitle", "metaDescription"],
};

export interface ProductInfo {
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  price: number;
  colors: string[];
  sizes: string[];
}
