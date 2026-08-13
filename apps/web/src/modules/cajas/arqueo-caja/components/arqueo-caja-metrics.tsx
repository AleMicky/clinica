"use client";

import { Calculator, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ArqueoCajaMetrics as ArqueoCajaMetricsType } from "../types/arqueo-caja.types";

interface ArqueoCajaMetricsProps {
  metrics: ArqueoCajaMetricsType;
  isLoading?: boolean;
}

export function ArqueoCajaMetrics({ metrics }: ArqueoCajaMetricsProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Arqueos</p>
            <h3 className="text-xl font-bold tracking-tight text-foreground mt-0.5 leading-none">
              {metrics.totalArqueos}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Calculator className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Cuadres Exactos</p>
            <h3 className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 leading-none">
              {metrics.totalConCuadreExacto}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Con Diferencias</p>
            <h3 className="text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-0.5 leading-none">
              {metrics.totalConDiferencia}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
