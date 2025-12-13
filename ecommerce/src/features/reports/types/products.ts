export interface TopProduct {
  id: number;
  name: string;
  reference: string;
  totalSold: number;
  revenue: number;
  stock: number;
}

export interface StockDistribution {
  status: "In Stock" | "Low Stock" | "Out of Stock";
  count: number;
}

export interface ProductReportResponse {
  topProducts: TopProduct[];
  stockDistribution: StockDistribution[];
  totalProducts: number;
  totalValue: number;
}
