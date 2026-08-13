"use client";

import { ArrowUpRight, ArrowDownLeft, Scale, ArrowLeftRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MovimientoCajaMetrics as MovimientoCajaMetricsType } from "../types/movimiento-caja.types";

interface MovimientoCajaMetricsProps {
  metrics: MovimientoCajaMetricsType;
  isLoading?: boolean;
}

export function MovimientoCajaMetrics({ metrics }: MovimientoCajaMetricsProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-4">
      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Movimientos</p>
            <h3 className="text-xl font-bold tracking-tight text-foreground mt-0.5 leading-none">
              {metrics.totalMovimientos}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Ingresos (+)</p>
            <h3 className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 leading-none">
              S/ {metrics.totalIngresos.toFixed(2)}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Egresos (-)</p>
            <h3 className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-0.5 leading-none">
              S/ {metrics.totalEgresos.toFixed(2)}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Balance Neto</p>
            <h3 className={`text-xl font-bold tracking-tight mt-0.5 leading-none ${metrics.balanceNeto >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600"}`}>
              S/ {metrics.balanceNeto.toFixed(2)}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Scale className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
