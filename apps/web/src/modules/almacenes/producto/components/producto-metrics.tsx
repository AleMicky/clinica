"use client";

import * as React from "react";
import { Boxes, Layers, CalendarClock, FolderTree } from "lucide-react";
import type { ProductoMetrics } from "../types/producto.types";

interface ProductoMetricsCardsProps {
  metrics: ProductoMetrics;
}

export function ProductoMetricsCards({ metrics }: ProductoMetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border/50 shadow-2xs">
        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
          <Boxes className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            Total Productos
          </p>
          <p className="text-base font-bold text-foreground leading-tight tracking-tight">
            {metrics.totalProductos}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border/50 shadow-2xs">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
          <Layers className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            Controlan Lote
          </p>
          <p className="text-base font-bold text-foreground leading-tight tracking-tight">
            {metrics.controlaLoteCount}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border/50 shadow-2xs">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
          <CalendarClock className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            Con Vencimiento
          </p>
          <p className="text-base font-bold text-foreground leading-tight tracking-tight">
            {metrics.controlaVencimientoCount}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border/50 shadow-2xs">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
          <FolderTree className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            Categorías
          </p>
          <p className="text-base font-bold text-foreground leading-tight tracking-tight">
            {metrics.categoriasCount}
          </p>
        </div>
      </div>
    </div>
  );
}
