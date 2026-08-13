"use client";

import { Clock, PlayCircle, StopCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TurnoCajaMetrics as TurnoCajaMetricsType } from "../types/turno-caja.types";

interface TurnoCajaMetricsProps {
  metrics: TurnoCajaMetricsType;
  isLoading?: boolean;
}

export function TurnoCajaMetrics({ metrics }: TurnoCajaMetricsProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Turnos</p>
            <h3 className="text-xl font-bold tracking-tight text-foreground mt-0.5 leading-none">
              {metrics.totalTurnos}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Turnos Abiertos</p>
            <h3 className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 leading-none">
              {metrics.turnosAbiertos}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <PlayCircle className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card shadow-2xs">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Turnos Cerrados</p>
            <h3 className="text-xl font-bold tracking-tight text-slate-500 mt-0.5 leading-none">
              {metrics.turnosCerrados}
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-500/10 text-slate-500">
            <StopCircle className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
