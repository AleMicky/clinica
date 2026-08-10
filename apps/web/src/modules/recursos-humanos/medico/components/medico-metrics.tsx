"use client";

import * as React from "react";
import { UserCheck, FileBadge, CheckCircle2 } from "lucide-react";

export interface MedicoMetrics {
  totalMedicos: number;
  conRegistroMinsal: number;
  medicosActivos: number;
}

interface MedicoMetricsProps {
  metrics: MedicoMetrics;
}

export function MedicoMetricsCards({ metrics }: MedicoMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {/* Total Médicos */}
      <div className="flex items-center p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs hover:border-primary/30 transition-colors gap-2.5">
        <div className="size-7 sm:size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <UserCheck className="size-3.5 sm:size-4" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Total Médicos
          </span>
          <span className="text-base sm:text-lg font-bold text-foreground leading-tight">
            {metrics.totalMedicos}
          </span>
        </div>
      </div>

      {/* Reg. Minsal */}
      <div className="flex items-center p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs hover:border-sky-500/30 transition-colors gap-2.5">
        <div className="size-7 sm:size-8 rounded-md bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
          <FileBadge className="size-3.5 sm:size-4" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Reg. Min. Salud
          </span>
          <span className="text-base sm:text-lg font-bold text-sky-600 dark:text-sky-400 leading-tight">
            {metrics.conRegistroMinsal}
          </span>
        </div>
      </div>

      {/* Médicos Activos */}
      <div className="flex items-center p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs hover:border-emerald-500/30 transition-colors gap-2.5">
        <div className="size-7 sm:size-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="size-3.5 sm:size-4" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Médicos Activos
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
            {metrics.medicosActivos}
          </span>
        </div>
      </div>
    </div>
  );
}
