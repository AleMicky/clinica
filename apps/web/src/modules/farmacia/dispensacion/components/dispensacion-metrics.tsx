"use client";

import * as React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  PackageCheck,
  Coins,
  Ban,
} from "lucide-react";
import type { DispensacionMetricsResponse } from "../types/dispensacion.types";

interface DispensacionMetricsProps {
  metrics?: DispensacionMetricsResponse | null;
  isLoading?: boolean;
}

export function DispensacionMetrics({
  metrics,
  isLoading = false,
}: DispensacionMetricsProps) {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "Bs. 0.00";
    return `Bs. ${Number(amount).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
      {/* 1. Total Dispensaciones */}
      <div className="bg-card border border-border/60 rounded-lg p-3 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Total Órdenes
          </span>
          <div className="size-6 rounded-md bg-muted/60 flex items-center justify-center text-foreground">
            <FileText className="size-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-xl font-bold text-foreground">
            {isLoading ? "..." : (metrics?.totalDispensaciones ?? 0)}
          </span>
          <span className="text-[10px] text-muted-foreground">emitidas</span>
        </div>
      </div>

      {/* 2. Pendiente de Pago en Caja */}
      <div className="bg-card border border-amber-500/20 bg-amber-500/5 rounded-lg p-3 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Pendiente en Caja
          </span>
          <div className="size-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="size-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400">
            {isLoading ? "..." : (metrics?.totalPendientesPago ?? 0)}
          </span>
          <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-300">
            {isLoading ? "..." : formatCurrency(metrics?.montoTotalPendiente)}
          </span>
        </div>
      </div>

      {/* 3. Pagadas / Listas para Entrega */}
      <div className="bg-card border border-blue-500/20 bg-blue-500/5 rounded-lg p-3 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-blue-700 dark:text-blue-400">
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Pagadas en Caja
          </span>
          <div className="size-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="size-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400">
            {isLoading ? "..." : (metrics?.totalPagadas ?? 0)}
          </span>
          <span className="text-[10px] text-blue-600/80 font-medium">por entregar</span>
        </div>
      </div>

      {/* 4. Entregadas / Stock Descontado */}
      <div className="bg-card border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Recaudado / Entregado
          </span>
          <div className="size-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Coins className="size-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
            {isLoading ? "..." : formatCurrency(metrics?.montoTotalRecaudado)}
          </span>
          <span className="text-[10px] text-emerald-700/80">
            {metrics?.totalEntregadas ?? 0} entregadas
          </span>
        </div>
      </div>
    </div>
  );
}
