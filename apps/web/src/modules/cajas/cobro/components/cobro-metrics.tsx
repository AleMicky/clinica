"use client";

import { CheckCircle2, Clock, DollarSign, Receipt, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CobroMetrics as CobroMetricsType } from "../types/cobro.types";

interface CobroMetricsProps {
  metrics: CobroMetricsType;
  isLoading?: boolean;
  isCompact?: boolean;
}

export function CobroMetrics({
  metrics,
  isLoading = false,
  isCompact = false,
}: Readonly<CobroMetricsProps>) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  // MODO ULTRA COMPACTO: Barra horizontal unificada tipo Ribbon
  if (isCompact) {
    return (
      <div className="rounded-lg border border-border/70 bg-card/80 backdrop-blur-xs px-3 py-1.5 flex flex-wrap items-center justify-between gap-y-1 gap-x-3 text-xs shadow-2xs">
        <div className="flex items-center gap-1.5">
          <Receipt className="size-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-[11px] text-muted-foreground font-medium">Total:</span>
          <span className="font-bold text-foreground font-mono">{metrics.totalCobros}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-[11px] text-muted-foreground font-medium">Por Cobrar:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
            {metrics.pendientesCobro}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] text-muted-foreground font-medium">Cobrados:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics.completados}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
          <span className="text-[11px] text-muted-foreground font-medium">Anulados:</span>
          <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
            {metrics.anulados}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] text-muted-foreground font-medium">Recaudado:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            Bs. {metrics.totalMontoCobrado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    );
  }

  // MODO ESTÁNDAR: Tarjetas estilizadas, ligeras y compactas
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {/* 1. Total Cobros */}
      <Card className="border border-border/70 bg-card hover:border-border transition-all duration-150 shadow-2xs">
        <CardContent className="p-2 sm:p-2.5 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Total Cobros
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-bold text-foreground font-mono tracking-tight">
                {metrics.totalCobros}
              </span>
              <span className="text-[10px] text-muted-foreground">reg.</span>
            </div>
          </div>
          <div className="size-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Receipt className="size-3.5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Por Cobrar */}
      <Card className="border border-border/70 bg-card hover:border-border transition-all duration-150 shadow-2xs">
        <CardContent className="p-2 sm:p-2.5 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Por Cobrar
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                {metrics.pendientesCobro}
              </span>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium">en caja</span>
            </div>
          </div>
          <div className="size-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Clock className="size-3.5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Cobrados */}
      <Card className="border border-border/70 bg-card hover:border-border transition-all duration-150 shadow-2xs">
        <CardContent className="p-2 sm:p-2.5 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Cobrados
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {metrics.completados}
              </span>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">abonados</span>
            </div>
          </div>
          <div className="size-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="size-3.5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Anulados */}
      <Card className="border border-border/70 bg-card hover:border-border transition-all duration-150 shadow-2xs">
        <CardContent className="p-2 sm:p-2.5 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Anulados
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                {metrics.anulados}
              </span>
              <span className="text-[10px] text-muted-foreground">canc.</span>
            </div>
          </div>
          <div className="size-7 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
            <XCircle className="size-3.5" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Total Recaudado */}
      <Card className="border border-border/70 bg-card hover:border-border transition-all duration-150 shadow-2xs col-span-2 sm:col-span-1 lg:col-span-1">
        <CardContent className="p-2 sm:p-2.5 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Total Recaudado
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-semibold text-emerald-600">Bs.</span>
              <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight truncate">
                {metrics.totalMontoCobrado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="size-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <DollarSign className="size-3.5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
