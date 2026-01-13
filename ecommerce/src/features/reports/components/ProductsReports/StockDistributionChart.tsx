"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { StockDistribution } from "../../types/products";
import { useTheme } from "next-themes";

interface StockDistributionChartProps {
  data: StockDistribution[];
}

const COLORS = {
  "In Stock": "#10b981",
  "Low Stock": "#f97316",
  "Out of Stock": "#ef4444",
};

export function StockDistributionChart({ data }: StockDistributionChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data as any[]}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
            nameKey="status"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.status as keyof typeof COLORS] || "#8884d8"}
                stroke={isDark ? "#1f2937" : "#fff"}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#e5e7eb",
              borderRadius: "8px",
              color: isDark ? "#ffffff" : "#000000",
            }}
            itemStyle={{ color: isDark ? "#ffffff" : "#000000" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: isDark ? "#d1d5db" : "#374151" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
