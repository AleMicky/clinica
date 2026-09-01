"use client";

import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type MetricColorVariant =
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "neutral";

export interface MetricItem {
  title: string;
  value?: string | number | React.ReactNode;
  description?: string;
  icon?: LucideIcon;
  variant?: MetricColorVariant;
  customColor?: {
    text: string;
    bg: string;
    border?: string;
  };
  isLoading?: boolean;
}

export interface MetricsGridProps {
  items: MetricItem[];
  variant?: "cards" | "compact";
  columns?: 2 | 3 | 4 | 5;
  isLoading?: boolean;
  className?: string;
}

const colorMap: Record<
  MetricColorVariant,
  { text: string; bg: string; border: string }
> = {
  primary: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  success: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  warning: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  info: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  danger: {
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
  neutral: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border/60",
  },
};

const columnGridClass: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
};

export function MetricsGrid({
  items,
  variant = "cards",
  columns = 4,
  isLoading = false,
  className,
}: MetricsGridProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "grid gap-3 bg-muted/20 p-2.5 rounded-lg border border-border/60",
          columnGridClass[columns] || columnGridClass[4],
          className
        )}
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          const loading = item.isLoading ?? isLoading;
          const style =
            item.customColor ??
            colorMap[item.variant || "primary"] ??
            colorMap.primary;

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1 min-w-0",
                idx > 0 && "sm:border-l sm:border-border/50"
              )}
            >
              {Icon && (
                <div
                  className={cn(
                    "p-2 rounded-md shrink-0 flex items-center justify-center",
                    style.bg,
                    style.text
                  )}
                >
                  <Icon className="size-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-muted-foreground truncate">
                  {item.title}
                </p>
                {loading ? (
                  <Skeleton className="h-5 w-16 mt-0.5" />
                ) : (
                  <p className="text-base font-bold text-foreground leading-tight truncate">
                    {item.value ?? "-"}
                  </p>
                )}
                {item.description && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3",
        columnGridClass[columns] || columnGridClass[4],
        className
      )}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        const loading = item.isLoading ?? isLoading;
        const style =
          item.customColor ??
          colorMap[item.variant || "primary"] ??
          colorMap.primary;

        return (
          <Card
            key={idx}
            className="border border-border/70 shadow-2xs bg-card/60 rounded-xl"
          >
            <CardContent className="p-4 flex items-center gap-3.5">
              {Icon && (
                <div
                  className={cn(
                    "p-2.5 rounded-lg border shrink-0 flex items-center justify-center",
                    style.bg,
                    style.text,
                    style.border
                  )}
                >
                  <Icon className="size-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {item.title}
                </p>
                {loading ? (
                  <Skeleton className="h-6 w-20 mt-1" />
                ) : (
                  <div className="text-xl font-bold text-foreground tracking-tight leading-tight mt-0.5 truncate">
                    {item.value ?? "-"}
                  </div>
                )}
                {item.description && (
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
