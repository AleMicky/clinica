"use client";

import * as React from "react";
import { Landmark, CheckCircle2, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { BancoMetrics } from "../types/banco.types";

interface BancoMetricsCardsProps {
  metrics: BancoMetrics;
}

export function BancoMetricsCards({ metrics }: BancoMetricsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="relative overflow-hidden border-border/60 bg-card shadow-xs transition-all hover:shadow-md">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Bancos
            </p>
            <p className="text-2xl font-bold text-foreground">
              {metrics.totalBancos}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Landmark className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-border/60 bg-card shadow-xs transition-all hover:shadow-md">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Bancos Activos
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.bancosActivos}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-border/60 bg-card shadow-xs transition-all hover:shadow-md">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Cuentas Bancarias Registradas
            </p>
            <p className="text-2xl font-bold text-primary">
              {metrics.cuentasBancariasActivas}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
