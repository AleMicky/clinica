"use client";

import * as React from "react";
import { HeartPulse, UserCheck, FileText, Handshake } from "lucide-react";
import type { PacienteMetrics } from "../types/paciente.types";

interface PacienteMetricsProps {
  metrics: PacienteMetrics;
}

export function PacienteMetricsCards({ metrics }: PacienteMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {/* Total Pacientes */}
      <div className="flex items-center p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs hover:border-primary/30 transition-colors gap-2.5">
        <div className="size-7 sm:size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <HeartPulse className="size-3.5 sm:size-4" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Total Pacientes
          </span>
          <span className="text-base sm:text-lg font-bold text-foreground leading-tight">
            {metrics.totalPacientes}
          </span>
        </div>
      </div>

      {/* Activos */}
      <div className="flex items-center p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs hover:border-emerald-500/30 transition-colors gap-2.5">
        <div className="size-7 sm:size-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <UserCheck className="size-3.5 sm:size-4" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Pacientes Activos
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
            {metrics.pacientesActivos}
          </span>
        </div>
      </div>

      {/* Con Teléfono */}
      <div className="flex items-center p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs hover:border-sky-500/30 transition-colors gap-2.5">
        <div className="size-7 sm:size-8 rounded-md bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
          <FileText className="size-3.5 sm:size-4" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Con Teléfono
          </span>
          <span className="text-base sm:text-lg font-bold text-sky-600 dark:text-sky-400 leading-tight">
            {metrics.conTelefono}
          </span>
        </div>
      </div>

      {/* Con Convenio */}
      <div className="flex items-center p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs hover:border-purple-500/30 transition-colors gap-2.5">
        <div className="size-7 sm:size-8 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
          <Handshake className="size-3.5 sm:size-4" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Con Convenio
          </span>
          <span className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400 leading-tight">
            {metrics.conConvenio}
          </span>
        </div>
      </div>
    </div>
  );
}
