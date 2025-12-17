export interface CustomerMetric {
  totalCustomers: number;
  newCustomers: number; 
  activeCustomers: number; 
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
