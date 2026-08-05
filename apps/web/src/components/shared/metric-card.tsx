"use client";

import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  isLoading?: boolean;
  isMono?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value = "-",
  description,
  icon: Icon,
  iconClassName = "text-primary",
  isLoading = false,
  isMono = true,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("shadow-xs", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        {Icon && <Icon className={cn("size-4 shrink-0", iconClassName)} />}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className={cn("text-2xl font-bold", isMono && "font-mono")}>
            {value}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
