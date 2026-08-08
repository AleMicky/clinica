"use client";

import * as React from "react";
import { Layers, FileText, CheckCircle2 } from "lucide-react";
import type { CategoriaServicioMetrics } from "../types/categoria-servicio.types";

interface CategoriaServicioMetricsProps {
  metrics: CategoriaServicioMetrics;
}

export function CategoriaServicioMetricsCards({ metrics }: CategoriaServicioMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-2.5 rounded-lg border">
      <div className="flex items-center gap-2.5 px-2 py-1">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
          <Layers className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Total Categorías</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.totalCategorias}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Con Descripción</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.conDescripcionCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Estado Activo</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.totalCategorias}</p>
        </div>
      </div>
    </div>
  );
}
