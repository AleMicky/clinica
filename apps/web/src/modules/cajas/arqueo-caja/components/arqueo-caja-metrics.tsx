"use client";

import * as React from "react";
import { Calculator, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArqueoCajaMetrics as ArqueoCajaMetricsType } from "../types/arqueo-caja.types";

interface ArqueoCajaMetricsProps {
  metrics: ArqueoCajaMetricsType;
  selectedFilter?: "TODOS" | "CUADRADOS" | "DIFERENCIA";
  onFilterChange?: (filter: "TODOS" | "CUADRADOS" | "DIFERENCIA") => void;
}

export function ArqueoCajaMetrics({
  metrics,
  selectedFilter = "TODOS",
  onFilterChange,
}: ArqueoCajaMetricsProps) {
  const cards = [
    {
      id: "total",
      label: "Total Arqueos",
      value: metrics.totalArqueos.toLocaleString("es-BO"),
      subtext: "Arqueos y cierres conciliados",
      icon: Calculator,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
      active: selectedFilter === "TODOS",
      onClick: () => onFilterChange?.("TODOS"),
    },
    {
      id: "cuadrados",
      label: "Cuadres Exactos",
      value: metrics.totalConCuadreExacto.toLocaleString("es-BO"),
      subtext: "Diferencia igual a Bs. 0.00",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      active: selectedFilter === "CUADRADOS",
      onClick: () => onFilterChange?.("CUADRADOS"),
    },
    {
      id: "diferencia",
      label: "Con Diferencias",
      value: metrics.totalConDiferencia.toLocaleString("es-BO"),
      subtext: "Sobrantes o faltantes de caja",
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      active: selectedFilter === "DIFERENCIA",
      onClick: () => onFilterChange?.("DIFERENCIA"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className={cn(
              "relative p-3.5 rounded-xl border bg-card transition-all duration-200 shadow-2xs flex flex-col justify-between min-h-[82px] cursor-pointer",
              card.active
                ? "border-primary ring-2 ring-primary/20 shadow-xs"
                : "border-border/60 hover:border-border hover:bg-muted/30"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                {card.label}
              </span>
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center border shrink-0",
                  card.bg,
                  card.color
                )}
              >
                <Icon className="size-4" />
              </div>
            </div>

            <div className="mt-1">
              <div className="text-xl font-bold font-mono tracking-tight text-foreground">
                {card.value}
              </div>
              <p className="text-[10.5px] text-muted-foreground truncate mt-0.5">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
