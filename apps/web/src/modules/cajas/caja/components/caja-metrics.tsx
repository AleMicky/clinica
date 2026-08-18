"use client";

import { Vault, CheckCircle2, XCircle } from "lucide-react";
import type { CajaMetrics as CajaMetricsType } from "../types/caja.types";

interface CajaMetricsProps {
  metrics: CajaMetricsType;
  isLoading?: boolean;
}

export function CajaMetrics({ metrics }: CajaMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Total Cajas
          </p>
          <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight mt-0.5">
            {metrics.totalCajas}
          </p>
        </div>
        <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Vault className="size-3.5 sm:size-4" />
        </div>
      </div>

      <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider truncate">
            Cajas Activas
          </p>
          <p className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">
            {metrics.cajasActivas}
          </p>
        </div>
        <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="size-3.5 sm:size-4" />
        </div>
      </div>

      <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            Cajas Inactivas
          </p>
          <p className="text-lg sm:text-xl font-bold tracking-tight text-slate-600 dark:text-slate-400 leading-tight mt-0.5">
            {metrics.cajasInactivas}
          </p>
        </div>
        <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-slate-500/10 text-slate-500 shrink-0">
          <XCircle className="size-3.5 sm:size-4" />
        </div>
      </div>
    </div>
  );
}
