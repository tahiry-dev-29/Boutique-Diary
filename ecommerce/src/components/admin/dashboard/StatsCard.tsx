import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  percentage?: number;
  color?: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  percentage,
  color = "bg-purple-100 text-purple-600",
}) => {
  const isPositive = percentage && percentage > 0;

  return (
    <Card className="border-none shadow-sm h-full bg-gray-100 dark:bg-gray-900 relative group overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6 flex items-center h-full gap-4 relative z-10">
        {percentage !== undefined && (
          <div
            className={cn(
              "absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold transition-transform group-hover:scale-105",
              isPositive
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
            )}
          >
            {isPositive ? "+" : ""}
            {percentage}%
          </div>
        )}
        <div
          className={cn(
            "p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300 shrink-0",
            color,
          )}
        >
          <Icon className="w-8 h-8" />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider truncate">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
            {value}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
