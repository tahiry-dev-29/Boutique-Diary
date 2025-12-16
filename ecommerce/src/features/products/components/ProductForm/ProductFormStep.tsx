import React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ProductFormStepProps {
  title: string;
  stepNumber: number;
  isOpen: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  description?: string;
}

export const ProductFormStep: React.FC<ProductFormStepProps> = ({
  title,
  stepNumber,
  isOpen,
  isCompleted,
  onToggle,
  children,
  description,
}) => {
  return (
    <Card
      className={cn(
        "transition-all duration-300 border-l-4",
        isOpen
          ? "border-l-primary ring-1 ring-primary/20"
          : isCompleted
            ? "border-l-green-500"
            : "border-l-transparent",
      )}
    >
      <CardHeader
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold transition-colors",
                isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : isOpen
                    ? "border-primary text-primary"
                    : "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
            </div>
            <div>
              <h3
                className={cn(
                  "text-lg font-semibold",
                  !isOpen && !isCompleted && "text-muted-foreground",
                )}
              >
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <div className="text-muted-foreground">
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mt-4 pl-6">{children}</div>
        </CardContent>
      )}
    </Card>
  );
};
