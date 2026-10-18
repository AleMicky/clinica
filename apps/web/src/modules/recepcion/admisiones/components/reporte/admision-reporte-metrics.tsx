"use client";

import * as React from "react";
import { Users, CreditCard, TrendingUp, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdmisionMetrics } from "../../types/admision.types";

interface AdmisionReporteMetricsProps {
  metrics: AdmisionMetrics | undefined;
  isLoading: boolean;
}

export function AdmisionReporteMetrics({
  metrics,
  isLoading,
}: AdmisionReporteMetricsProps) {
  const total = metrics?.total ?? metrics?.totalHoy ?? 0;
  const montoTotal = metrics?.montoTotal ?? metrics?.montoTotalHoy ?? 0;
  const tasaEfectividad = metrics?.tasaEfectividad !== undefined
    ? metrics.tasaEfectividad.toFixed(1)
    : (total > 0
        ? (((metrics?.confirmadas ?? 0) + (metrics?.enviadasVenta ?? 0)) / total * 100).toFixed(1)
        : "0.0");

  const registradas = metrics?.registradas ?? 0;
  const confirmadas = metrics?.confirmadas ?? 0;
  const enviadasVenta = metrics?.enviadasVenta ?? 0;
  const canceladas = metrics?.canceladas ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full min-w-0">
      {/* Card 1: Total Admisiones */}
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4 shadow-xs hover:border-blue-500/30 hover:shadow-sm transition-all group">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Admisiones
            </span>
            {isLoading ? (
              <Skeleton className="h-7 w-20 rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground tracking-tight">
                  {total.toLocaleString("es-BO")}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  atenciones
                </span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground/80">
              Registradas en el período
            </p>
          </div>
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
            <Users className="size-5" />
          </div>
        </div>
      </div>

      {/* Card 2: Monto Total Acumulado */}
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4 shadow-xs hover:border-emerald-500/30 hover:shadow-sm transition-all group">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Facturación Estimada
            </span>
            {isLoading ? (
              <Skeleton className="h-7 w-28 rounded-md" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Bs.</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground/80">
              Total prestaciones generadas
            </p>
          </div>
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
            <CreditCard className="size-5" />
          </div>
        </div>
      </div>

      {/* Card 3: Tasa de Efectividad */}
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4 shadow-xs hover:border-purple-500/30 hover:shadow-sm transition-all group">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Tasa de Concreción
            </span>
            {isLoading ? (
              <Skeleton className="h-7 w-20 rounded-md" />
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  {tasaEfectividad}%
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  efectivas
                </span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground/80">
              Confirmadas & enviadas a venta
            </p>
          </div>
          <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
            <TrendingUp className="size-5" />
          </div>
        </div>
      </div>

      {/* Card 4: Desglose Operativo por Estados */}
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4 shadow-xs hover:border-border/70 hover:shadow-sm transition-all">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="size-3.5 text-primary" />
            Desglose por Estado
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            {total} reg.
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-full rounded" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium border border-blue-500/15">
              <span className="text-[11px] flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-blue-500" />
                Reg.
              </span>
              <span className="font-bold text-[11px]">{registradas}</span>
            </div>

            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-500/15">
              <span className="text-[11px] flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Conf.
              </span>
              <span className="font-bold text-[11px]">{confirmadas}</span>
            </div>

            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium border border-purple-500/15">
              <span className="text-[11px] flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-purple-500" />
                Venta
              </span>
              <span className="font-bold text-[11px]">{enviadasVenta}</span>
            </div>

            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 font-medium border border-rose-500/15">
              <span className="text-[11px] flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-rose-500" />
                Canc.
              </span>
              <span className="font-bold text-[11px]">{canceladas}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

