import React from "react";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  backHref?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  backHref,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
