"use client";

import * as React from "react";
import { Users, UserCheck, FileText } from "lucide-react";
import type { PersonaMetrics } from "../types/persona.types";

interface PersonaMetricsProps {
  metrics: PersonaMetrics;
}

export function PersonaMetricsCards({ metrics }: PersonaMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {/* Total Personas */}
      <div className="flex items-center p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs hover:border-primary/30 transition-colors gap-2.5">
        <div className="size-7 sm:size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Users className="size-3.5 sm:size-4" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Total Personas
          </span>
          <span className="text-base sm:text-lg font-bold text-foreground leading-tight">
            {metrics.totalPersonas}
          </span>
        </div>
      </div>

      {/* Activas */}
      <div className="flex items-center p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs hover:border-emerald-500/30 transition-colors gap-2.5">
        <div className="size-7 sm:size-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <UserCheck className="size-3.5 sm:size-4" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Personas Activas
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
            {metrics.personasActivas}
          </span>
        </div>
      </div>

      {/* Inactivas */}
      <div className="flex items-center p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs hover:border-destructive/30 transition-colors gap-2.5">
        <div className="size-7 sm:size-8 rounded-md bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
          <FileText className="size-3.5 sm:size-4" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Inactivas / Bajas
          </span>
          <span className="text-base sm:text-lg font-bold text-destructive leading-tight">
            {metrics.personasInactivas}
          </span>
        </div>
      </div>
    </div>
  );
}
