"use client";

import * as React from "react";
import { Coins, TrendingUp, Calendar, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AperturaMetricsData {
  totalAperturas: number;
  montoTotalInicial: number;
  aperturasHoy: number;
  promedioInicial: number;
}

interface AperturaCajaMetricsProps {
  metrics: AperturaMetricsData;
  selectedFilter?: "TODOS" | "HOY";
  onFilterChange?: (filter: "TODOS" | "HOY") => void;
}

export function AperturaCajaMetrics({
  metrics,
  selectedFilter = "TODOS",
  onFilterChange,
}: AperturaCajaMetricsProps) {
  const cards = [
    {
      id: "total",
      label: "Total Aperturas",
      value: metrics.totalAperturas.toLocaleString("es-BO"),
      subtext: "Registros en sistema",
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
      active: selectedFilter === "TODOS",
      onClick: () => onFilterChange?.("TODOS"),
    },
    {
      id: "montoTotal",
      label: "Fondo Inicial Total",
      value: `Bs. ${metrics.montoTotalInicial.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: "Efectivo total entregado",
      icon: Coins,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      active: false,
    },
    {
      id: "hoy",
      label: "Aperturas de Hoy",
      value: metrics.aperturasHoy.toLocaleString("es-BO"),
      subtext: "Turnos iniciados en la fecha",
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      active: selectedFilter === "HOY",
      onClick: () => onFilterChange?.("HOY"),
    },
    {
      id: "promedio",
      label: "Fondo Inicial Promedio",
      value: `Bs. ${metrics.promedioInicial.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: "Por apertura de turno",
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      active: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {cards.map((card) => {
        const Icon = card.icon;
        const isClickable = Boolean(card.onClick);

        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className={cn(
              "relative p-3 rounded-xl border bg-card transition-all duration-200 shadow-2xs flex flex-col justify-between min-h-[78px]",
              card.active
                ? "border-primary ring-2 ring-primary/20 shadow-xs"
                : "border-border/70 hover:border-border",
              isClickable && "cursor-pointer hover:bg-muted/30"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-muted-foreground truncate">
                {card.label}
              </span>
              <div
                className={cn(
                  "size-7 rounded-lg flex items-center justify-center border shrink-0",
                  card.bg,
                  card.color
                )}
              >
                <Icon className="size-3.5" />
              </div>
            </div>

            <div className="mt-1">
              <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-foreground">
                {card.value}
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
