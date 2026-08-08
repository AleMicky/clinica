"use client";

import * as React from "react";
import { Tag, Star, Calendar } from "lucide-react";
import type { TarifarioMetrics } from "../types/tarifario.types";

interface TarifarioMetricsProps {
  metrics: TarifarioMetrics;
}

export function TarifarioMetricsCards({ metrics }: TarifarioMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-2.5 rounded-lg border">
      <div className="flex items-center gap-2.5 px-2 py-1">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
          <Tag className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Total Tarifarios</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.totalTarifarios}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
          <Star className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Tarifarios Principales</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.principalesCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Calendar className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Tarifarios Vigentes</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.vigentesCount}</p>
        </div>
      </div>
    </div>
  );
}
