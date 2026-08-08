"use client";

import * as React from "react";
import { Handshake, Calendar, FileText } from "lucide-react";
import type { ConvenioMetrics } from "../types/convenio.types";

interface ConvenioMetricsProps {
  metrics: ConvenioMetrics;
}

export function ConvenioMetricsCards({ metrics }: ConvenioMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-2.5 rounded-lg border">
      <div className="flex items-center gap-2.5 px-2 py-1">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
          <Handshake className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Total Convenios</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.totalConvenios}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Calendar className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Convenios Vigentes</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.vigentesCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Con Detalles / Notas</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.conDescripcionCount}</p>
        </div>
      </div>
    </div>
  );
}
