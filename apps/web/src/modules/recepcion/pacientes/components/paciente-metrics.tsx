"use client";

import * as React from "react";
import { Users, UserCheck, Phone, Building2 } from "lucide-react";
import type { PacienteMetrics } from "../types/paciente.types";

interface PacienteMetricsCardsProps {
  metrics: PacienteMetrics;
}

export function PacienteMetricsCards({ metrics }: Readonly<PacienteMetricsCardsProps>) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {/* 1. Total Pacientes */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/60 bg-card/60 shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Total Pacientes
          </p>
          <p className="text-sm font-bold text-foreground font-mono leading-tight">
            {metrics.totalPacientes}
          </p>
        </div>
        <div className="size-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Users className="size-3.5" />
        </div>
      </div>

      {/* 2. Pacientes Activos */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/60 bg-card/60 shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Activos
          </p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono leading-tight">
            {metrics.pacientesActivos}
          </p>
        </div>
        <div className="size-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <UserCheck className="size-3.5" />
        </div>
      </div>

      {/* 3. Con Teléfono de Contacto */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/60 bg-card/60 shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Con Teléfono
          </p>
          <p className="text-sm font-bold text-purple-600 dark:text-purple-400 font-mono leading-tight">
            {metrics.conTelefono}
          </p>
        </div>
        <div className="size-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
          <Phone className="size-3.5" />
        </div>
      </div>

      {/* 4. Con Convenio */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/60 bg-card/60 shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Con Convenio
          </p>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono leading-tight">
            {metrics.conConvenio}
          </p>
        </div>
        <div className="size-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
          <Building2 className="size-3.5" />
        </div>
      </div>
    </div>
  );
}
