"use client";

import { CheckCircle2, Clock, DollarSign, Receipt, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CobroMetrics as CobroMetricsType } from "../types/cobro.types";

interface CobroMetricsProps {
  metrics: CobroMetricsType;
  isLoading?: boolean;
}

export function CobroMetrics({ metrics }: CobroMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {/* 1. Total Cobros */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Cobros
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                {metrics.totalCobros}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                registros
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Receipt className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Por Cobrar */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Por Cobrar
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                {metrics.pendientesCobro}
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">
                en caja
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Clock className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Cobrados */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Cobrados
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.completados}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                abonados
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Anulados */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Anulados
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                {metrics.anulados}
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">
                cancelados
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
            <XCircle className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Total Recaudado */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200 col-span-2 sm:col-span-1 lg:col-span-1">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Recaudado
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-semibold text-emerald-600">Bs.</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.totalMontoCobrado.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <DollarSign className="size-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
