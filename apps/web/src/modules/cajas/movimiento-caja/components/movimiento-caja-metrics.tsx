"use client";

import { ArrowUpRight, ArrowDownLeft, Scale, ArrowLeftRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MovimientoCajaMetrics as MovimientoCajaMetricsType } from "../types/movimiento-caja.types";

interface MovimientoCajaMetricsProps {
  metrics: MovimientoCajaMetricsType;
  isLoading?: boolean;
}

function formatBs(val: number): string {
  return Number(val || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function MovimientoCajaMetrics({
  metrics,
  isLoading = false,
}: Readonly<MovimientoCajaMetricsProps>) {
  const isPositiveBalance = (metrics.balanceNeto ?? 0) >= 0;

  return (
    <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-4">
      {/* Total Movimientos */}
      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Movimientos
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <h3 className="text-xl font-bold tracking-tight text-foreground leading-none">
                {metrics.totalMovimientos.toLocaleString("es-BO")}
              </h3>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      {/* Ingresos (+) */}
      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Ingresos (+)
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Bs.
                </span>
                <h3 className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 leading-none">
                  {formatBs(metrics.totalIngresos)}
                </h3>
              </div>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      {/* Egresos (-) */}
      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Egresos (-)
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  Bs.
                </span>
                <h3 className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400 leading-none">
                  {formatBs(metrics.totalEgresos)}
                </h3>
              </div>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      {/* Balance Neto */}
      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Balance Neto
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-xs font-semibold ${
                    isPositiveBalance
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  Bs.
                </span>
                <h3
                  className={`text-xl font-bold tracking-tight leading-none ${
                    isPositiveBalance
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatBs(metrics.balanceNeto)}
                </h3>
              </div>
            )}
          </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${
              isPositiveBalance
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            <Scale className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
