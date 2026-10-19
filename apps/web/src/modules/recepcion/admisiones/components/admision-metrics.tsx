"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CheckCircle2, Send, DollarSign } from "lucide-react";
import type { AdmisionMetrics } from "../types/admision.types";

interface AdmisionMetricsCardsProps {
  metrics: AdmisionMetrics;
  isLoading?: boolean;
}

export function AdmisionMetricsCards({ metrics, isLoading = false }: Readonly<AdmisionMetricsCardsProps>) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/50 bg-card">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="size-6 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const formattedMonto = new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(metrics.montoTotalHoy);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {/* 1. Total Admisiones Hoy */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/60 bg-card/60 shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Admisiones Hoy
          </p>
          <p className="text-sm font-bold text-foreground font-mono leading-tight">
            {metrics.totalHoy}
          </p>
        </div>
        <div className="size-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Users className="size-3.5" />
        </div>
      </div>

      {/* 2. Confirmadas */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/60 bg-card/60 shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Confirmadas
          </p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono leading-tight">
            {metrics.confirmadas}
          </p>
        </div>
        <div className="size-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <CheckCircle2 className="size-3.5" />
        </div>
      </div>

      {/* 3. Enviadas a Venta */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/60 bg-card/60 shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            En Caja
          </p>
          <p className="text-sm font-bold text-purple-600 dark:text-purple-400 font-mono leading-tight">
            {metrics.enviadasVenta}
          </p>
        </div>
        <div className="size-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
          <Send className="size-3.5" />
        </div>
      </div>

      {/* 4. Monto Facturado */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/60 bg-card/60 shadow-2xs">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Volumen Día
          </p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono leading-tight">
            <span className="text-[11px] font-normal mr-1">Bs.</span>
            {formattedMonto}
          </p>
        </div>
        <div className="size-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <DollarSign className="size-3.5" />
        </div>
      </div>
    </div>
  );
}
