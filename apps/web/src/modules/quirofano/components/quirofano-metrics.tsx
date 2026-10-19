"use client";

import * as React from "react";
import {
  Calendar,
  Activity,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";
import type { CirugiaMetricsResponse } from "../types/quirofano.types";

interface QuirofanoMetricsProps {
  metrics?: CirugiaMetricsResponse;
  isLoading?: boolean;
}

export function QuirofanoMetrics({
  metrics,
  isLoading = false,
}: QuirofanoMetricsProps) {
  const cards = [
    {
      title: "Cirugías Totales",
      value: metrics?.totalCirugias ?? 0,
      icon: Activity,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      description: "Registros de intervenciones",
    },
    {
      title: "Programadas",
      value: metrics?.totalProgramadas ?? 0,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      description: "Listas para preparación",
    },
    {
      title: "En Quirófano / Curso",
      value: metrics?.totalEnCurso ?? 0,
      icon: Activity,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      description: "Intervenciones activas ahora",
    },
    {
      title: "Finalizadas",
      value: metrics?.totalFinalizadas ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      description: "Stock descontado en ALM-QUI",
    },
    {
      title: "Consumo Quirúrgico",
      value: `Bs. ${(metrics?.montoTotalMaterialesConsumidos ?? 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Package,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      description: "Materiales e insumos estériles",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-3 rounded-xl border border-border/70 bg-card shadow-2xs flex flex-col justify-between transition-all hover:border-border"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground truncate">
                {c.title}
              </span>
              <div
                className={`size-7 rounded-lg flex items-center justify-center shrink-0 border ${c.bg} ${c.color}`}
              >
                <Icon className="size-3.5" />
              </div>
            </div>

            <div className="mt-2">
              <div className="text-lg font-bold font-mono tracking-tight text-foreground">
                {isLoading ? (
                  <span className="inline-block size-4 rounded bg-muted animate-pulse" />
                ) : (
                  c.value
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {c.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
