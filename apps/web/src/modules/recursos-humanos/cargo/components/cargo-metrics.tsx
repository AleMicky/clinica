"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, CheckCircle2, XCircle, Layers } from "lucide-react";

export interface CargoMetrics {
  total: number;
  activos: number;
  inactivos: number;
}

interface CargoMetricsProps {
  metrics: CargoMetrics;
}

export function CargoMetricsCards({ metrics }: CargoMetricsProps) {
  const tasaActividad =
    metrics.total > 0
      ? Math.round((metrics.activos / metrics.total) * 100)
      : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Cargos */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Cargos
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                {metrics.total}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                puestos
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Award className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Cargos Activos */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Cargos Activos
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.activos}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                vigentes
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Cargos Inactivos */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Cargos Inactivos
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                {metrics.inactivos}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                deshabilitados
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
            <XCircle className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Tasa Operativa */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Tasa de Operación
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                {tasaActividad}%
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium ml-1">
                vigencia
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Layers className="size-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}