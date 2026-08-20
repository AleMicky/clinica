"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Phone, Building2 } from "lucide-react";
import type { PacienteMetrics } from "../types/paciente.types";

interface PacienteMetricsCardsProps {
  metrics: PacienteMetrics;
}

export function PacienteMetricsCards({ metrics }: PacienteMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Pacientes */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Pacientes
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                {metrics.totalPacientes}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                historias clínicas
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Users className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Pacientes Activos */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Pacientes Activos
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.pacientesActivos}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                con atención vigente
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <UserCheck className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Con Teléfono de Contacto */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Con Teléfono
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                {metrics.conTelefono}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                contactables
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Phone className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Con Convenio */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Con Convenio
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                {metrics.conConvenio}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium ml-1">
                asegurados
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Building2 className="size-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
