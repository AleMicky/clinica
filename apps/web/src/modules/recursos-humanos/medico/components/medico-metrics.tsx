"use client";

import * as React from "react";
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

  const items = [
    {
      label: "Total Médicos",
      value: metrics.totalMedicos,
      sublabel: "cuerpo médico",
      icon: Stethoscope,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Médicos Activos",
      value: metrics.medicosActivos,
      sublabel: "en atención",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Reg. Min. Salud",
      value: metrics.conRegistroMinsal,
      sublabel: "homologados",
      icon: FileBadge,
      color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      label: "Reg. Profesional",
      value: `${porcentajeMinsal}%`,
      sublabel: "cobertura",
      icon: Award,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-card shadow-2xs hover:border-border transition-all"
          >
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                {item.label}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                  {item.value}
                </span>
                <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                  {item.sublabel}
                </span>
              </div>
            </div>
            <div
              className={`size-7 sm:size-8 rounded-lg flex items-center justify-center border shrink-0 ${item.color}`}
            >
              <Icon className="size-3.5 sm:size-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
