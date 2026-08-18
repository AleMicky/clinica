"use client";

import { Calculator, CheckCircle2, AlertCircle } from "lucide-react";
import type { ArqueoCajaMetrics as ArqueoCajaMetricsType } from "../types/arqueo-caja.types";

interface ArqueoCajaMetricsProps {
  metrics: ArqueoCajaMetricsType;
  isLoading?: boolean;
}

export function ArqueoCajaMetrics({ metrics }: ArqueoCajaMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Total Arqueos
          </p>
          <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight mt-0.5">
            {metrics.totalArqueos}
          </p>
        </div>
        <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Calculator className="size-3.5 sm:size-4" />
        </div>
      </div>

      <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider truncate">
            Cuadres Exactos
          </p>
          <p className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">
            {metrics.totalConCuadreExacto}
          </p>
        </div>
        <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="size-3.5 sm:size-4" />
        </div>
      </div>

      <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider truncate">
            Con Diferencias
          </p>
          <p className="text-lg sm:text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400 leading-tight mt-0.5">
            {metrics.totalConDiferencia}
          </p>
        </div>
        <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
          <AlertCircle className="size-3.5 sm:size-4" />
        </div>
      </div>
    </div>
  );
}
