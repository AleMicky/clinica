"use client";

import * as React from "react";
import { Stethoscope, CheckCircle2, CircleX } from "lucide-react";
import type { EspecialidadMetrics } from "../types/especialidad.types";

interface EspecialidadMetricsProps {
  metrics: EspecialidadMetrics;
}

export function EspecialidadMetricsCards({ metrics }: EspecialidadMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-2.5 rounded-lg border">
      <div className="flex items-center gap-2.5 px-2 py-1">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
          <Stethoscope className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">
            Total Especialidades
          </p>
          <p className="text-base font-bold text-foreground leading-tight">
            {metrics.totalEspecialidades}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">
            Especialidades Activas
          </p>
          <p className="text-base font-bold text-foreground leading-tight">
            {metrics.especialidadesActivas}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-muted text-muted-foreground shrink-0">
          <CircleX className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">
            Especialidades Inactivas
          </p>
          <p className="text-base font-bold text-foreground leading-tight">
            {metrics.especialidadesInactivas}
          </p>
        </div>
      </div>
    </div>
  );
}
