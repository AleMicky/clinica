"use client";

import * as React from "react";
import { Users, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* Card 1: Total Admisiones */}
      <Card className="border border-border/70 bg-card hover:border-primary/30 transition-all shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Registros
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-foreground tracking-tight">
                  {total}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  en el período
                </span>
              </div>
            )}
          </div>
          <div className="size-8.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Users className="size-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Monto Total Acumulado */}
      <Card className="border border-border/70 bg-card hover:border-emerald-500/30 transition-all shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Facturación
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Bs.</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
          <div className="size-8.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <CreditCard className="size-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Tasa de Efectividad */}
      <Card className="border border-border/70 bg-card hover:border-purple-500/30 transition-all shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Efectividad / Cierre
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  {tasaEfectividad}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  validadas
                </span>
              </div>
            )}
          </div>
          <div className="size-8.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
            <TrendingUp className="size-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Desglose Rápido de Estados */}
      <Card className="border border-border/70 bg-card shadow-2xs">
        <CardContent className="p-2.5 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Desglose por Estado
          </p>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-1 pt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-blue-500/5 text-blue-600 dark:text-blue-400 font-medium">
                <span>Reg.:</span>
                <span className="font-bold">{registradas}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Conf.:</span>
                <span className="font-bold">{confirmadas}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-purple-500/5 text-purple-600 dark:text-purple-400 font-medium">
                <span>Venta:</span>
                <span className="font-bold">{enviadasVenta}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-rose-500/5 text-rose-600 dark:text-rose-400 font-medium">
                <span>Canc.:</span>
                <span className="font-bold">{canceladas}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
