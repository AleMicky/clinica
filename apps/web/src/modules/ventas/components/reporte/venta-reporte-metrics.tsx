"use client";

import * as React from "react";
import {
  TrendingUp,
  Target,
  Wallet,
  Tag,
  CheckCircle2,
  Clock,
  Ban,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { VentaMetrics } from "../../types/ventas.types";

interface VentaReporteMetricsProps {
  metrics: VentaMetrics | undefined;
  isLoading: boolean;
}

export function VentaReporteMetrics({
  metrics,
  isLoading,
}: Readonly<VentaReporteMetricsProps>) {
  const total = metrics?.totalVentas ?? 0;
  const montoTotal = metrics?.montoTotal ?? 0;
  const montoCobrado = metrics?.montoCobrado ?? 0;
  const montoPorCobrar = metrics?.montoPorCobrar ?? 0;
  const totalDescuentos = metrics?.totalDescuentos ?? 0;
  const subtotalBruto = metrics?.subtotalBruto ?? montoTotal + totalDescuentos;
  const ticketPromedio = metrics?.ticketPromedio ?? (total > 0 ? montoTotal / total : 0);

  const pagadas = metrics?.pagadas ?? 0;
  const pendientes = (metrics?.pendientes ?? 0) + (metrics?.pendientesCobro ?? 0);
  const anuladas = metrics?.anuladas ?? 0;

  const validSales = total - anuladas;
  const tasaCobranza = montoTotal > 0
    ? ((montoCobrado / montoTotal) * 100).toFixed(1)
    : "0.0";
  const porcentajeDescuento = subtotalBruto > 0
    ? ((totalDescuentos / subtotalBruto) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-2.5">
      {/* 4 Main Commercial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Facturación Neta Total */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Facturación Neta Total
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-32 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Bs.</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  <ArrowUpRight className="size-3" />
                  {validSales}
                </span>
                <span>ventas válidas emitidas</span>
              </div>
            </div>
            <div className="size-10.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="size-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Ticket Promedio por Venta */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-teal-500/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Ticket Promedio (AOV)
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-28 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">Bs.</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {ticketPromedio.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                Valor promedio generado por transacción
              </p>
            </div>
            <div className="size-10.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <Target className="size-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Cobrado Efectivo vs Por Cobrar */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Recaudación Cobrada
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-28 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Bs.</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {montoCobrado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
                    {tasaCobranza}%
                  </span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Por cobrar: <span className="font-semibold text-amber-600 dark:text-amber-400">Bs. {montoPorCobrar.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </p>
            </div>
            <div className="size-10.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="size-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Descuentos y Promociones */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4.5 shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Descuentos Otorgados
              </span>
              {isLoading ? (
                <Skeleton className="h-8 w-28 rounded-md" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Bs.</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {totalDescuentos.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {totalDescuentos > 0 && (
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      ({porcentajeDescuento}%)
                    </span>
                  )}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Subtotal bruto: Bs. {subtotalBruto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="size-10.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <Tag className="size-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Quick Summary Ribbon */}
      <div className="bg-card/60 backdrop-blur-xs rounded-xl border border-border/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Receipt className="size-3.5 text-primary" />
            <span>Total Transacciones:</span>
            <span className="font-bold text-foreground font-mono">{total}</span>
          </div>
          <div className="h-3 w-px bg-border/60 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Ventas Pagadas:</span>
            <span className="font-bold text-foreground font-mono">{pagadas}</span>
          </div>
          <div className="h-3 w-px bg-border/60 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-amber-500" />
            <span>Pendientes de Cobro:</span>
            <span className="font-bold text-foreground font-mono">{pendientes}</span>
          </div>
          {anuladas > 0 && (
            <>
              <div className="h-3 w-px bg-border/60 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-rose-500">
                <Ban className="size-3.5" />
                <span>Anuladas:</span>
                <span className="font-bold font-mono">{anuladas}</span>
              </div>
            </>
          )}
        </div>

        <div className="text-[11px] text-muted-foreground/80 font-medium">
          Valores calculados sobre el período filtrado
        </div>
      </div>
    </div>
  );
}
