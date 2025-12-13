export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface SalesChartDataPoint {
  date: string;
  amount: number;
  orders: number;
  aov: number;
}

export interface SalesReportResponse {
  summary: SalesSummary;
  chartData: SalesChartDataPoint[];
}
