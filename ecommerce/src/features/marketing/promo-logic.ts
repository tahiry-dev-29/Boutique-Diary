import { z } from "zod";

export const createCustomPromoSchema = z
  .object({
    codeName: z
      .string()
      .min(3, "Minimum 3 caractères")
      .max(15, "Maximum 15 caractères")
      .regex(/^[A-Z0-9]+$/, "Uniquement des lettres majuscules et chiffres"),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discountValue: z.number(),
    duration: z.string().optional(), // Added to capture duration in schema if needed
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "PERCENTAGE") {
      if (data.discountValue < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimum 2%",
          path: ["discountValue"],
        });
      }
      if (data.discountValue > 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum 20%",
          path: ["discountValue"],
        });
      }
    } else {
      if (data.discountValue < 2000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimum 2 000 Ar",
          path: ["discountValue"],
        });
      }
      if (data.discountValue > 100000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum 100 000 Ar",
          path: ["discountValue"],
        });
      }
    }
  });

export type CreateCustomPromoInput = z.infer<typeof createCustomPromoSchema>;

/**
 * Advanced Pricing Model for Custom Promo Codes
 * @param duration selected duration key
 * @param type discount type
 * @param value discount value
 * @returns price in Ar
 */
export function calculateActivationPrice(
  duration: string,
  type: "PERCENTAGE" | "FIXED_AMOUNT",
  value: number,
): number {
  const BASE_PRICE = 20000; // Raised base price

  // 1. Duration Factor (Fd) - More aggressive scaling
  const durationFactors: Record<string, number> = {
    "1_WEEK": 0.4,
    "1_MONTH": 1.0,
    "3_MONTHS": 3.5, // Significant increase for 3 months
    "1_YEAR": 15.0, // High commitment, higher cost
  };
  const Fd = durationFactors[duration] || 1.0;

  // 2. Value Factor (Fv)
  let Fv = 1.0;
  if (type === "PERCENTAGE") {
    // Sharp Exponential: (v/10)^2.5
    // 10% -> 1.0
    // 20% -> 5.6
    Fv = Math.pow(value / 10, 2.5);
  } else {
    // Progressive Linear: (v / 10000) ^ 1.2
    // 10,000 Ar -> 1.0
    // 50,000 Ar -> 6.8
    // 100,000 Ar -> 15.8
    Fv = Math.pow(value / 10000, 1.2);
  }

  // Senior Math: Add a fixed processing fee that scales with duration
  const fee = 5000 * Fd;

  return Math.max(2000, Math.round(BASE_PRICE * Fd * Fv + fee));
}
