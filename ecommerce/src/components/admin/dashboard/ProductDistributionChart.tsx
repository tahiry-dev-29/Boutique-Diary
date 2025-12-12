"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProductDistributionProps {
  data?: { name: string; value: number; color: string }[];
}

const defaultData = [
  { name: "Electronics", value: 400, color: "#be185d" },
  { name: "Clothing", value: 300, color: "#16a34a" },
  { name: "Home", value: 300, color: "#1e1b4b" },
];

const ProductDistributionChart: React.FC<ProductDistributionProps> = ({
  data = defaultData,
}) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="border-none shadow-sm h-full bg-white dark:bg-gray-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
          Productos
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              cornerRadius={10}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, name]}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ bottom: 0, fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        {}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-4">
          <span className="text-3xl font-bold text-gray-800 dark:text-white block">
            {total}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDistributionChart;
