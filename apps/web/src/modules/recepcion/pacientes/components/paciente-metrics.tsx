"use client";

import * as React from "react";
import { HeartPulse, UserCheck, Phone, Handshake, TrendingUp } from "lucide-react";
import type { PacienteMetrics } from "../types/paciente.types";

interface PacienteMetricsProps {
  metrics: PacienteMetrics;
}

export function PacienteMetricsCards({ metrics }: PacienteMetricsProps) {
  const percentActivos = metrics.totalPacientes > 0
    ? Math.round((metrics.pacientesActivos / metrics.totalPacientes) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Total Pacientes Card */}
      <div className="group relative p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 size-16 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Pacientes
          </span>
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <HeartPulse className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            {metrics.totalPacientes}
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="size-3" />
            Vigentes
          </span>
        </div>
      </div>

      {/* Activos Card */}
      <div className="group relative p-3.5 rounded-xl border border-border/70 bg-card hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 size-16 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Pacientes Activos
          </span>
          <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <UserCheck className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.pacientesActivos}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
            {percentActivos}%
          </span>
        </div>
      </div>

      {/* Con Teléfono Card */}
      <div className="group relative p-3.5 rounded-xl border border-border/70 bg-card hover:border-sky-500/50 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 size-16 bg-sky-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Con Contacto
          </span>
          <div className="size-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
            <Phone className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-sky-600 dark:text-sky-400">
            {metrics.conTelefono}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            Verificados
          </span>
        </div>
      </div>

      {/* Con Convenio Card */}
      <div className="group relative p-3.5 rounded-xl border border-border/70 bg-card hover:border-purple-500/50 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 size-16 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Con Convenio
          </span>
          <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
            <Handshake className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400">
            {metrics.conConvenio}
          </span>
          <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
            Asegurados
          </span>
        </div>
      </div>
    </div>
  );
}
