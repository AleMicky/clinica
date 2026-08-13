"use client";

import { Vault, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CajaMetrics as CajaMetricsType } from "../types/caja.types";

interface CajaMetricsProps {
  metrics: CajaMetricsType;
  isLoading?: boolean;
}

export function CajaMetrics({ metrics }: CajaMetricsProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Cajas</p>
            <h3 className="text-xl font-bold tracking-tight text-foreground mt-0.5 leading-none">
              {metrics.totalCajas}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Vault className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Cajas Activas</p>
            <h3 className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 leading-none">
              {metrics.cajasActivas}
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
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Cajas Inactivas</p>
            <h3 className="text-xl font-bold tracking-tight text-slate-500 mt-0.5 leading-none">
              {metrics.cajasInactivas}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-500/10 text-slate-500">
            <XCircle className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
