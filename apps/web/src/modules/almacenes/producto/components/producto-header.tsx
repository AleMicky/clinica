"use client";

import * as React from "react";
import { Boxes } from "lucide-react";

export function ProductoHeader() {
  return (
    <div className="flex items-center gap-2.5 pb-1 border-b border-border/40">
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
        <Boxes className="size-4" />
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <h1 className="text-sm font-semibold text-foreground tracking-tight">
          Catálogo de Productos
        </h1>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Gestión de artículos, medicamentos, insumos, lotes y niveles de stock
        </span>
      </div>
    </div>
  );
}
