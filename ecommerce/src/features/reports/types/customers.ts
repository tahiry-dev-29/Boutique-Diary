export interface CustomerMetric {
  totalCustomers: number;
  newCustomers: number; // Last 30 days
  activeCustomers: number; // Ordered in last 30 days - Simplified: User.isActive
}

export interface TopCustomer {
  id: number;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export interface CustomerReportResponse {
  metrics: CustomerMetric;
  topCustomers: TopCustomer[];
  recentSignups: { date: string; count: number }[];
}
