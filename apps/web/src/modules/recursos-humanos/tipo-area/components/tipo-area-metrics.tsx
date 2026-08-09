"use client";

import * as React from "react";
import { Building2, CheckCircle2, XCircle, Hash } from "lucide-react";

export interface TipoAreaMetrics {
  total: number;
  activos: number;
  inactivos: number;
  ordenMax: number;
}

interface TipoAreaMetricsProps {
  metrics: TipoAreaMetrics;
}

export function TipoAreaMetricsCards({ metrics }: TipoAreaMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-muted/20 p-2.5 rounded-lg border">
      <div className="flex items-center gap-2.5 px-2 py-1">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
          <Building2 className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Total de Tipos</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.total}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Tipos Activos</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.activos}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 lg:border-l lg:border-border/60">
        <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
          <XCircle className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Tipos Inactivos</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.inactivos}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 lg:border-l lg:border-border/60">
        <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
          <Hash className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Orden Máximo</p>
          <p className="text-base font-bold text-foreground leading-tight font-mono">{metrics.ordenMax}</p>
        </div>
      </div>
    </div>
  );
}