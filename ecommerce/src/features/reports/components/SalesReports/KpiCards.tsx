import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from "recharts";

interface KpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ElementType;
  chartData?: any[]; 
  chartType?: "area" | "bar";
  color?: string; 
}

export function KpiCard({
  title,
  value,
  subValue,
  trend,
  trendValue,
  icon: Icon,
  chartData,
  chartType = "area",
  color = "#8b5cf6", 
}: KpiCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-500"
      : trend === "down"
        ? "text-rose-500"
        : "text-gray-500";

  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow bg-gray-100 dark:bg-gray-900 overflow-hidden relative group">
      {}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-[50px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-20 dark:opacity-20 dark:group-hover:opacity-30"
        style={{ backgroundColor: color }}
      />

      <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {title}
            </p>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {value}
            </div>
          </div>
          {Icon && (
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-100/5 backdrop-blur-sm border border-gray-100 dark:border-white/10">
              <Icon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-4 mt-auto">
          <div className="flex flex-col gap-1">
            {trend && (
              <div
                className={`flex items-center text-sm font-medium ${trendColor}`}
              >
                <TrendIcon className="mr-1 h-4 w-4" />
                {trendValue}
              </div>
            )}
            {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
          </div>

          {}
          {chartData && chartData.length > 0 && (
            <div className="h-12 w-24 sm:w-32">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id={`gradient-${title}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#gradient-${title})`}
                      isAnimationActive={false} 
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData}>
                    <Bar
                      dataKey="value"
                      fill={color}
                      radius={[2, 2, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
