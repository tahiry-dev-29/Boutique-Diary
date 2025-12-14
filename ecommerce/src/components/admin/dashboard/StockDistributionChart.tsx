"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StockDistributionProps {
  data?: { name: string; stock?: number; value?: number }[];
}

const StockDistributionChart: React.FC<StockDistributionProps> = ({
  data = [],
}) => {
  // Use stock if available, otherwise fallback (though should be available)
  const processedData = data
    .map(item => ({
      name: item.name,
      stock: item.stock || 0,
    }))
    .sort((a, b) => b.stock - a.stock); // Sort desc

  const COLORS = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#f59e0b", // amber
    "#ec4899", // pink
    "#06b6d4", // cyan
  ];

  return (
    <Card className="border-none shadow-sm h-full bg-gray-100 dark:bg-gray-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
          Stock par Catégorie
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.1}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={value => [value, "Unités"]}
            />
            <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StockDistributionChart;
