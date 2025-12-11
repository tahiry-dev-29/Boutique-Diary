"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PackageOpen, FileQuestion, Search, AlertCircle } from "lucide-react";
import { Button } from "./button";

type EmptyStateVariant = "default" | "search" | "error" | "custom";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantIcons: Record<
  Exclude<EmptyStateVariant, "custom">,
  React.ReactNode
> = {
  default: <PackageOpen className="h-12 w-12 text-muted-foreground/50" />,
  search: <Search className="h-12 w-12 text-muted-foreground/50" />,
  error: <AlertCircle className="h-12 w-12 text-destructive/50" />,
};

export function EmptyState({
  variant = "default",
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const IconComponent =
    icon ||
    (variant !== "custom" ? (
      variantIcons[variant]
    ) : (
      <FileQuestion className="h-12 w-12 text-muted-foreground/50" />
    ));

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 text-center",
        className,
      )}
    >
      {IconComponent}
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
