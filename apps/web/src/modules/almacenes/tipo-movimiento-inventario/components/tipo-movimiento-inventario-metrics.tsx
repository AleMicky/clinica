"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowUpRight, Layers } from "lucide-react";
import { NaturalezaMovimiento, type TipoMovimientoInventarioResponse } from "../types/tipo-movimiento-inventario.types";
import { Skeleton } from "@/components/ui/skeleton";

interface TipoMovimientoInventarioMetricsProps {
  tipos: TipoMovimientoInventarioResponse[];
  totalItems: number;
  isLoading?: boolean;
}

export function TipoMovimientoInventarioMetrics({
  tipos,
  totalItems,
  isLoading = false,
}: TipoMovimientoInventarioMetricsProps) {
  const entradasCount = React.useMemo(
    () => tipos.filter((t) => t.naturaleza === NaturalezaMovimiento.Entrada).length,
    [tipos]
  );

  const salidasCount = React.useMemo(
    () => tipos.filter((t) => t.naturaleza === NaturalezaMovimiento.Salida).length,
    [tipos]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 bg-card space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Total Card */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/80 shadow-2xs hover:border-border transition-colors">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Total Registrados
          </p>
          <p className="text-xl font-bold tracking-tight text-foreground">
            {totalItems}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Layers className="size-4.5" />
        </div>
      </div>

      {/* Entradas Card */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-2xs hover:border-emerald-500/30 transition-colors">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Entradas (+ Stock)
            </p>
          </div>
          <p className="text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-200">
            {entradasCount}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ArrowDownLeft className="size-4.5" />
        </div>
      </div>

      {/* Salidas Card */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 shadow-2xs hover:border-amber-500/30 transition-colors">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Salidas (- Stock)
            </p>
          </div>
          <p className="text-xl font-bold tracking-tight text-amber-950 dark:text-amber-200">
            {salidasCount}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <ArrowUpRight className="size-4.5" />
        </div>
      </div>
    </div>
  );
}
