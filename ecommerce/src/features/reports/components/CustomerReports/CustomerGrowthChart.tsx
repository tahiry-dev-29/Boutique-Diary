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
} from "recharts";
import { useTheme } from "next-themes";

interface CustomerGrowthChartProps {
  data: { date: string; count: number }[];
}

export function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
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
            stroke={isDark ? "#374151" : "#e5e7eb"}
          />
          <XAxis
            dataKey="date"
            stroke={isDark ? "#9ca3af" : "#6b7280"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={isDark ? "#9ca3af" : "#6b7280"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: isDark ? "#374151" : "#f3f4f6" }}
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#e5e7eb",
              borderRadius: "8px",
              color: isDark ? "#ffffff" : "#000000",
            }}
            itemStyle={{ color: isDark ? "#ffffff" : "#000000" }}
          />
          <Bar
            dataKey="count"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
