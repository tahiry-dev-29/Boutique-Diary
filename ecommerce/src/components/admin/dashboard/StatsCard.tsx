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
    <Card className="border-none shadow-sm h-full">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className={cn("p-3 rounded-xl", color)}>
            <Icon className="w-6 h-6" />
          </div>
          {percentage !== undefined && (
            <div
              className={cn(
                "px-2 py-1 rounded-full text-xs font-bold",
                isPositive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600",
              )}
            >
              {isPositive ? "+" : ""}
              {percentage}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
