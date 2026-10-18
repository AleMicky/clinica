"use client";

import * as React from "react";
import {
  TrendingUp,
  Receipt,
  Wallet,
  Clock,
  Ban,
  CheckCircle2,
  ArrowUpRight,
  CreditCard,
  Percent,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CobroMetrics } from "../../types/cobro.types";

interface CobroReporteMetricsProps {
  metrics: CobroMetrics | undefined;
  isLoading: boolean;
}

export function CobroReporteMetrics({
  metrics,
  isLoading,
}: Readonly<CobroReporteMetricsProps>) {
  const total = metrics?.totalCobros ?? 0;
  const montoCobrado = metrics?.totalMontoCobrado ?? 0;
  const montoPendiente = metrics?.totalMontoPendiente ?? 0;
  const completados = metrics?.completados ?? 0;
  const pendientes = metrics?.pendientesCobro ?? 0;
  const anulados = metrics?.anulados ?? 0;
  const ticketPromedio = metrics?.ticketPromedio ?? (completados > 0 ? montoCobrado / completados : 0);

  const tasaCobranza = total > 0 ? ((completados / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-2.5 w-full min-w-0">
      {/* 4 Main Commercial & Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full min-w-0">
        {/* Card 1: Total Recaudado */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Recaudado (Efectivo & Medios)
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-32 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Bs.</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {montoCobrado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  <ArrowUpRight className="size-3" />
                  {completados}
                </span>
                <span>cobros confirmados</span>
              </div>
            </div>
            <div className="size-10.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="size-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Ticket Promedio por Cobro */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-sky-500/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Ticket Promedio de Cobro
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-28 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-sky-600 dark:text-sky-400">Bs.</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {ticketPromedio.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="text-[11px] text-muted-foreground">
                Por transacción recaudada exitosamente
              </div>
            </div>
            <div className="size-10.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="size-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Monto Pendiente por Cobrar */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Monto en Cola / Por Cobrar
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-28 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Bs.</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {montoPendiente.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {pendientes}
                </span>
                <span>cobros registrados pendientes</span>
              </div>
            </div>
            <div className="size-10.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="size-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Tasa de Efectividad */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-indigo-500/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Efectividad de Cobro
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-24 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {tasaCobranza}%
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="font-semibold text-rose-500">
                  {anulados} anulados
                </span>
                <span>de {total} registros</span>
              </div>
            </div>
            <div className="size-10.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <Percent className="size-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Mini status bar indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-card/60 border border-border/40 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Confirmados:</span>
          </div>
          <span className="text-xs font-bold text-foreground">{completados}</span>
        </div>

        <div className="bg-card/60 border border-border/40 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">En Espera:</span>
          </div>
          <span className="text-xs font-bold text-foreground">{pendientes}</span>
        </div>

        <div className="bg-card/60 border border-border/40 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban className="size-3.5 text-rose-500" />
            <span className="text-xs text-muted-foreground">Anulados:</span>
          </div>
          <span className="text-xs font-bold text-foreground">{anulados}</span>
        </div>

        <div className="bg-card/60 border border-border/40 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="size-3.5 text-sky-500" />
            <span className="text-xs text-muted-foreground">Total Transacciones:</span>
          </div>
          <span className="text-xs font-bold text-foreground">{total}</span>
        </div>
      </div>
    </div>
  );
}
