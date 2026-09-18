"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CheckCircle2, Send, DollarSign } from "lucide-react";
import type { AdmisionMetrics } from "../types/admision.types";

interface AdmisionMetricsCardsProps {
  metrics: AdmisionMetrics;
  isLoading?: boolean;
}

export function AdmisionMetricsCards({ metrics, isLoading = false }: AdmisionMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-border/70 bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="size-9 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const formattedMonto = new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(metrics.montoTotalHoy);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Admisiones Hoy */}
      <Card className="border border-border/70 bg-card hover:border-blue-500/30 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Admisiones del Día
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-foreground tracking-tight">
                {metrics.totalHoy}
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.2 rounded border border-blue-500/20">
                Hoy
              </span>
            </div>
          </div>
          <div className="size-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0 shadow-2xs">
            <Users className="size-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Confirmadas */}
      <Card className="border border-border/70 bg-card hover:border-emerald-500/30 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Confirmadas
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.confirmadas}
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/20">
                Validadas
              </span>
            </div>
          </div>
          <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 shadow-2xs">
            <CheckCircle2 className="size-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Enviadas a Venta */}
      <Card className="border border-border/70 bg-card hover:border-purple-500/30 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Enviadas a Venta
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                {metrics.enviadasVenta}
              </span>
              <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold px-1.5 py-0.2 rounded border border-purple-500/20">
                En Caja
              </span>
            </div>
          </div>
          <div className="size-9 rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0 shadow-2xs">
            <Send className="size-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Monto Facturado / Recaudado Día */}
      <Card className="border border-border/70 bg-card hover:border-emerald-500/30 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Volumen Estimado Día
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Bs.</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formattedMonto}
              </span>
            </div>
          </div>
          <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 shadow-2xs">
            <DollarSign className="size-4.5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
