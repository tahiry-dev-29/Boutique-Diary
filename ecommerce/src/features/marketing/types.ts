export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

export interface PromoCode {
  id: number;
  code: string;
  type: DiscountType;
  value: number;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  usageCount: number;
  minOrderAmount?: number | null;
  costPoints?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED";
  ownerId?: number | null;
}

export interface PromotionRule {
  id: number;
  name: string;
  priority: number;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
