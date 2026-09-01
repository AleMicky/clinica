"use client";

import * as React from "react";
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TipoMovimientoInventarioHeaderProps {
  totalItems?: number;
}

export function TipoMovimientoInventarioHeader({
  totalItems = 0,
}: TipoMovimientoInventarioHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-3.5">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <ArrowLeftRight className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Tipos de Movimiento de Inventario
            </h1>
            <p className="text-xs text-muted-foreground">
              Define y clasifica las razones de entrada y salida de stock en los almacenes clínicos.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        >
          <ArrowDownLeft className="size-3.5" />
          <span>Entradas (Stock +)</span>
        </Badge>
        <Badge
          variant="outline"
          className="text-xs font-normal py-1 px-2.5 gap-1.5 bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
        >
          <ArrowUpRight className="size-3.5" />
          <span>Salidas (Stock -)</span>
        </Badge>
      </div>
    </div>
  );
}
