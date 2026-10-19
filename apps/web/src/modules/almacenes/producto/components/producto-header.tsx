"use client";

import { Boxes, CalendarClock, FolderTree } from "lucide-react";
import type { ProductoMetrics } from "../types/producto.types";

interface ProductoHeaderProps {
  metrics?: ProductoMetrics;
}

export function ProductoHeader({ metrics }: Readonly<ProductoHeaderProps>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1.5 border-b border-border/40">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
          <Boxes className="size-4" />
        </div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            Catálogo de Productos
          </h1>
          <span className="text-xs text-muted-foreground hidden md:inline">
            Gestión de artículos, medicamentos, insumos y niveles de stock
          </span>
        </div>
      </div>

      {metrics && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/40 border border-border/50 text-[11px] font-medium text-muted-foreground">
            <Boxes className="size-3.5 text-primary" />
            <span>Total:</span>
            <span className="font-bold text-foreground font-mono">{metrics.totalProductos}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/40 border border-border/50 text-[11px] font-medium text-muted-foreground">
            <CalendarClock className="size-3.5 text-amber-500" />
            <span>Con Vencimiento:</span>
            <span className="font-bold text-foreground font-mono">{metrics.controlaVencimientoCount}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/40 border border-border/50 text-[11px] font-medium text-muted-foreground">
            <FolderTree className="size-3.5 text-emerald-500" />
            <span>Categorías:</span>
            <span className="font-bold text-foreground font-mono">{metrics.categoriasCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
