"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, CheckCircle2, FileBadge, Award } from "lucide-react";

export interface MedicoMetrics {
  totalMedicos: number;
  conRegistroMinsal: number;
  medicosActivos: number;
}

interface MedicoMetricsProps {
  metrics: MedicoMetrics;
}

export function MedicoMetricsCards({ metrics }: MedicoMetricsProps) {
  const porcentajeMinsal =
    metrics.totalMedicos > 0
      ? Math.round((metrics.conRegistroMinsal / metrics.totalMedicos) * 100)
      : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Médicos */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Médicos
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                {metrics.totalMedicos}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                cuerpo médico
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Stethoscope className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Médicos Activos */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Médicos Activos
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.medicosActivos}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                en atención
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Reg. Min. Salud */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Reg. Min. Salud
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400 tracking-tight">
                {metrics.conRegistroMinsal}
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
                homologados
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 shrink-0">
            <FileBadge className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Cobertura Profesional */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Reg. Profesional
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                {porcentajeMinsal}%
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium ml-1">
                conducción oficial
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Award className="size-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
