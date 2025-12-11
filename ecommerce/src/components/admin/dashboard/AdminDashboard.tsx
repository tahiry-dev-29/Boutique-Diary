"use client";

import React from "react";
import DashboardHeader from "./DashboardHeader";
import StatsCard from "./StatsCard";
import RevenueChart from "./RevenueChart";
import ProductDistributionChart from "./ProductDistributionChart";
import RecentPages from "./RecentPages";
import { Copy, FileText, CheckCircle, Clock } from "lucide-react";

interface AdminDashboardProps {
  user: {
    username: string;
    email: string;
    avatarUrl?: string; // Add if available
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  // Mock data for the cards, replacing with real data if available later
  const stats = [
    {
      title: "Ventas totales",
      value: "$2,500",
      icon: FileText,
      color: "bg-white/20 text-white", // Special styling for the first card
      percentage: undefined,
      isPrimary: true,
    },
    {
      title: "Comisión total",
      value: "50",
      icon: Copy,
      color: "bg-purple-100 text-purple-600",
      percentage: 10,
    },
    {
      title: "Pagos pendientes",
      value: "50",
      icon: Clock,
      color: "bg-pink-100 text-pink-600",
      percentage: -5,
    },
    {
      title: "Total Pólizas Vendidas",
      value: "50",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
      percentage: 20,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <DashboardHeader user={user} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          Bienvenido {user.username} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-gray-500 mt-1">Martes 02 de febrero de 2025</p>
      </div>

      {/* Top Section: Stats Grid + Product Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Grid - Takes up 2 columns */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Primary Purple Card */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between h-[180px]">
            <div className="p-3 bg-white/20 rounded-xl w-fit">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 font-medium">Ventas totales</p>
              <h3 className="text-3xl font-bold mt-1">$2,500</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="h-[180px]">
            <StatsCard
              title="Comisión total"
              value="50"
              icon={Copy}
              color="bg-purple-100 text-purple-600"
              percentage={10}
            />
          </div>

          {/* Card 3 */}
          <div className="h-[180px]">
            <StatsCard
              title="Pagos pendientes"
              value="50"
              icon={Copy} // Using Copy as placeholder logic
              color="bg-pink-100 text-pink-600"
              percentage={-5}
            />
          </div>

          {/* Card 4 */}
          <div className="h-[180px]">
            <StatsCard
              title="Total Pólizas Vendidas"
              value="50"
              icon={CheckCircle}
              color="bg-green-100 text-green-600"
              percentage={20}
            />
          </div>
        </div>

        {/* Product Distribution Chart - Takes up 1 column but spans height */}
        <div className="lg:col-span-1 h-[384px] md:h-auto">
          <ProductDistributionChart />
        </div>
      </div>

      {/* Bottom Section: Recent Pages + Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <RecentPages />
        </div>
        <div className="h-[400px]">
          <RevenueChart />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
