"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, DollarSign, Receipt, Send } from "lucide-react";
import type { VentaMetrics } from "../types/ventas.types";

interface VentaMetricsCardsProps {
  metrics: VentaMetrics;
}

export function VentaMetricsCards({ metrics }: VentaMetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {/* 1. Total Ventas del Día */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Ventas
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                {metrics.totalVentas}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                hoy
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Receipt className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Pendientes (por enviar a caja) */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Pendientes
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                {metrics.pendientes}
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">
                sin enviar
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Clock className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 3. En Caja (Pendientes de Cobro) */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              En Caja
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                {metrics.pendientesCobro}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                por cobrar
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <Send className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Pagadas */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Pagadas
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.pagadas}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                cobradas
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Monto Total Recaudado */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200 col-span-2 sm:col-span-1 lg:col-span-1">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Monto del Día
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-semibold text-emerald-600">Bs.</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.montoTotal.toFixed(2)}
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
