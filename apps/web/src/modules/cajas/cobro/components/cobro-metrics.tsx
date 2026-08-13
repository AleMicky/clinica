"use client";

import { CreditCard, DollarSign, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CobroMetrics as CobroMetricsType } from "../types/cobro.types";

interface CobroMetricsProps {
  metrics: CobroMetricsType;
  isLoading?: boolean;
}

export function CobroMetrics({ metrics }: CobroMetricsProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Cobros</p>
            <h3 className="text-xl font-bold tracking-tight text-foreground mt-0.5 leading-none">
              {metrics.totalCobros}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CreditCard className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Cobrado (S/)</p>
            <h3 className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 leading-none">
              S/ {metrics.totalMontoCobrado.toFixed(2)}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Cobros Anulados</p>
            <h3 className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-0.5 leading-none">
              {metrics.totalAnulados}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <XCircle className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
