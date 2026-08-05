"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  active?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
}

export function StatusBadge({
  active = true,
  activeLabel = "Activo",
  inactiveLabel = "Inactivo",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={active ? "outline" : "destructive"}
      className={cn(
        "w-fit gap-1 text-xs font-medium",
        active ? "bg-green-500/10 text-green-600 border-green-500/20" : "",
        className
      )}
    >
      {active ? (
        <CheckCircle2 className="size-3 shrink-0" />
      ) : (
        <XCircle className="size-3 shrink-0" />
      )}
      <span>{active ? activeLabel : inactiveLabel}</span>
    </Badge>
  );
}
