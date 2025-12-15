import React, { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import StatsCard from "./StatsCard";
import RevenueChart from "./RevenueChart";
import ProductDistributionChart from "./ProductDistributionChart";
import StockDistributionChart from "./StockDistributionChart";
import RecentPages from "./RecentPages";
import {
  Copy,
  FileText,
  CheckCircle,
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface AdminDashboardProps {
  user: {
    username: string;
    email: string;
    avatarUrl?: string;
  };
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    totalOrders: 0,
    categoryDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent inline-block">
          Bienvenue {user.username}{" "}
          <span className="text-2xl text-foreground">👋</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Tableau de bord administrateur
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Value Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between h-[150px] border border-white/10">
          <div className="p-2.5 bg-white/20 rounded-lg w-fit">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-[11px] font-medium uppercase tracking-wider">
              Valeur du Stock
            </p>
            <h3 className="text-2xl lg:text-3xl font-bold mt-1">
              {loading ? "..." : formatCurrency(stats.totalStockValue)}
            </h3>
          </div>
        </div>

        {/* Total Products */}
        <div className="h-[150px]">
          <StatsCard
            title="Total Produits"
            value={loading ? "..." : stats.totalProducts.toString()}
            icon={Package}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
            percentage={0}
          />
        </div>

        {/* In Stock */}
        <div className="h-[150px]">
          <StatsCard
            title="En Stock"
            value={
              loading
                ? "..."
                : (stats.totalProducts - stats.lowStockCount).toString()
            }
            icon={CheckCircle}
            color="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            percentage={0}
          />
        </div>
      </div>

        {/* Low Stock */}
        <div className="h-[150px]">
          <StatsCard
            title="Rupture / Faible Stock"
            value={loading ? "..." : stats.lowStockCount.toString()}
            icon={AlertTriangle}
            color="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
            percentage={0}
          />
        </div>
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <ProductDistributionChart data={stats.categoryDistribution} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <RecentPages />
        </div>
        <div className="lg:col-span-1 h-[400px]">
          <StockDistributionChart data={stats.categoryDistribution} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
