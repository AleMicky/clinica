"use client";

import { Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TurnoCajaMetrics as TurnoCajaMetricsType } from "../types/turno-caja.types";

interface TurnoCajaMetricsProps {
  metrics: TurnoCajaMetricsType;
  isLoading?: boolean;
  selectedFilter?: "TODOS" | "ABIERTOS" | "CERRADOS";
  onFilterChange?: (tab: "TODOS" | "ABIERTOS" | "CERRADOS") => void;
}

export function TurnoCajaMetrics({
  metrics,
  isLoading = false,
  selectedFilter = "TODOS",
  onFilterChange,
}: TurnoCajaMetricsProps) {
  const abiertosPct =
    metrics.totalTurnos > 0
      ? Math.round((metrics.turnosAbiertos / metrics.totalTurnos) * 100)
      : 0;

  const cerradosPct =
    metrics.totalTurnos > 0
      ? Math.round((metrics.turnosCerrados / metrics.totalTurnos) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      {/* Total Turnos */}
      <div
        onClick={() => onFilterChange?.("TODOS")}
        className={`group relative overflow-hidden p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
          selectedFilter === "TODOS"
            ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
            : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Turnos
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 my-0.5" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {metrics.totalTurnos}
                </span>
                <span className="text-[11px] text-muted-foreground">registrados</span>
              </div>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="size-5" />
          </div>
        </div>
      </div>

      {/* Turnos Abiertos */}
      <div
        onClick={() => onFilterChange?.("ABIERTOS")}
        className={`group relative overflow-hidden p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
          selectedFilter === "ABIERTOS"
            ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30"
            : "border-border/60 bg-card hover:border-emerald-500/40 hover:bg-emerald-500/5"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Turnos Activos
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-16 my-0.5" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {metrics.turnosAbiertos}
                </span>
                <span className="text-[11px] font-medium text-emerald-600/80 dark:text-emerald-400/80">
                  ({abiertosPct}% en caja)
                </span>
              </div>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0 group-hover:scale-105 transition-transform">
            <PlayCircle className="size-5" />
          </div>
        </div>
      </div>

      {/* Turnos Cerrados */}
      <div
        onClick={() => onFilterChange?.("CERRADOS")}
        className={`group relative overflow-hidden p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
          selectedFilter === "CERRADOS"
            ? "border-slate-500/50 bg-slate-500/10 ring-1 ring-slate-500/30"
            : "border-border/60 bg-card hover:border-slate-400/50 hover:bg-muted/30"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Turnos Finalizados
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 my-0.5" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {metrics.turnosCerrados}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ({cerradosPct}% completados)
                </span>
              </div>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="size-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
