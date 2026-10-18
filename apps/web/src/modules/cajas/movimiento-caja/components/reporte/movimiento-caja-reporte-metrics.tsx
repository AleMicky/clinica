"use client";

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MovimientoCajaMetricsResponse } from "../../types/movimiento-caja.types";

interface MovimientoCajaReporteMetricsProps {
  metrics: MovimientoCajaMetricsResponse | undefined;
  isLoading: boolean;
}

export function MovimientoCajaReporteMetrics({
  metrics,
  isLoading,
}: Readonly<MovimientoCajaReporteMetricsProps>) {
  const total = metrics?.totalMovimientos ?? 0;
  const ingresos = metrics?.totalIngresos ?? 0;
  const egresos = metrics?.totalEgresos ?? 0;
  const balance = metrics?.balanceNeto ?? (ingresos - egresos);
  const cantIngresos = metrics?.cantidadIngresos ?? 0;
  const cantEgresos = metrics?.cantidadEgresos ?? 0;
  const promIngreso = metrics?.promedioIngreso ?? (cantIngresos > 0 ? ingresos / cantIngresos : 0);
  const promEgreso = metrics?.promedioEgreso ?? (cantEgresos > 0 ? egresos / cantEgresos : 0);

  const isPositiveBalance = balance >= 0;

  return (
    <div className="space-y-2.5 w-full min-w-0">
      {/* 4 Main Cash Flow & Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full min-w-0">
        {/* Card 1: Total Ingresos */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Ingresos (Entradas)
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-32 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Bs.</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {ingresos.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  <ArrowUpRight className="size-3" />
                  {cantIngresos}
                </span>
                <span>movimientos de entrada</span>
              </div>
            </div>
            <div className="size-10.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="size-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Egresos */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-rose-500/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Egresos (Salidas)
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-32 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">Bs.</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {egresos.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center">
                  <ArrowDownRight className="size-3" />
                  {cantEgresos}
                </span>
                <span>movimientos de salida</span>
              </div>
            </div>
            <div className="size-10.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <TrendingDown className="size-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Balance Neto */}
        <div className={`bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs transition-all group relative overflow-hidden ${
          isPositiveBalance ? "hover:border-emerald-500/40" : "hover:border-rose-500/40"
        } hover:shadow-md`}>
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${
            isPositiveBalance ? "from-emerald-500/10" : "from-rose-500/10"
          } via-transparent to-transparent rounded-bl-full pointer-events-none`} />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Flujo Neto / Balance
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-32 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm font-bold ${isPositiveBalance ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>Bs.</span>
                  <span className={`text-2xl font-black tracking-tight ${isPositiveBalance ? "text-foreground" : "text-rose-600 dark:text-rose-400"}`}>
                    {balance >= 0 ? "+" : ""}
                    {balance.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className={`font-semibold ${isPositiveBalance ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {isPositiveBalance ? "Superávit neto de caja" : "Déficit / Egreso superior"}
                </span>
              </div>
            </div>
            <div className={`size-10.5 rounded-xl ${
              isPositiveBalance
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            } flex items-center justify-center border shadow-2xs shrink-0 group-hover:scale-105 transition-transform`}>
              <Scale className="size-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Total Operaciones */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Operaciones Registradas
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-24 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {total}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">transacciones</span>
                </div>
              )}
              <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span>Prom. Ingreso: <strong className="text-foreground">Bs. {promIngreso.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
              </div>
            </div>
            <div className="size-10.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="size-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary micro-bar with averages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-1">
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-muted/30 border border-border/30 text-xs text-muted-foreground">
          <span>Promedio por Entrada:</span>
          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            Bs. {promIngreso.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-muted/30 border border-border/30 text-xs text-muted-foreground">
          <span>Promedio por Salida:</span>
          <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
            Bs. {promEgreso.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-muted/30 border border-border/30 text-xs text-muted-foreground">
          <span>Volumen Total Movilizado:</span>
          <span className="font-mono font-semibold text-foreground">
            Bs. {(ingresos + egresos).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
