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
    avatarUrl?: string;
  };
}

interface AdminDashboardProps {
  user: {
    username: string;
    email: string;
    avatarUrl?: string;
  };
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  return (
    <div className="min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          Bienvenue {user.username} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Tableau de bord administrateur
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between h-[180px]">
            <div className="p-3 bg-white/20 rounded-xl w-fit">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 font-medium">Ventas totales</p>
              <h3 className="text-3xl font-bold mt-1">$2,500</h3>
            </div>
          </div>

          {}
          <div className="h-[180px]">
            <StatsCard
              title="Comisión total"
              value="50"
              icon={Copy}
              color="bg-purple-100 text-purple-600"
              percentage={10}
            />
          </div>

          {}
          <div className="h-[180px]">
            <StatsCard
              title="Pagos pendientes"
              value="50"
              icon={Copy}
              color="bg-pink-100 text-pink-600"
              percentage={-5}
            />
          </div>

          {}
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

        {}
        <div className="lg:col-span-1 h-[384px] md:h-auto">
          <ProductDistributionChart />
        </div>
      </div>

      {}
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
