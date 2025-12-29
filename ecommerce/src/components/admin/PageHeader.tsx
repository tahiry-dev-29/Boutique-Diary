import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  backHref?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  backHref,
  onRefresh,
  isLoading,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8",
        className,
      )}
    >
      <div className={cn("flex items-center", backHref && "gap-4")}>
        {backHref && (
          <Link
            href={backHref}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
        )}
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border-none hover:bg-gray-200 dark:hover:bg-gray-700 h-10 px-4"
          >
            <RefreshCcw
              className={cn("w-4 h-4", isLoading && "animate-spin")}
            />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
