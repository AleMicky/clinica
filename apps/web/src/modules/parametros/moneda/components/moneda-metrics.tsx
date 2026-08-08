"use client";

import * as React from "react";
import { Star, Coins, Globe, CircleX } from "lucide-react";
import type { MonedaMetrics } from "../types/moneda.types";

interface MonedaMetricsProps {
  metrics: MonedaMetrics;
}

export function MonedaMetricsCards({ metrics }: MonedaMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-muted/20 p-2.5 rounded-lg border">
      <div className="flex items-center gap-2.5 px-2 py-1">
        <div className="p-2 rounded-md bg-amber-500/10 text-amber-500 shrink-0">
          <Star className="size-4 fill-amber-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Moneda Principal</p>
          <p className="text-base font-bold text-foreground leading-tight truncate">{metrics.monedaBase}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
          <Coins className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Monedas Habilitadas</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.monedasHabilitadas}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 lg:border-l lg:border-border/60">
        <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Globe className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Facturación Multimoneda</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.facturacionMultimoneda ? "Activa" : "Inactiva"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 lg:border-l lg:border-border/60">
        <div className="p-2 rounded-md bg-muted text-muted-foreground shrink-0">
          <CircleX className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Monedas Inactivas</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.monedasInactivas}</p>
        </div>
      </div>
    </div>
  );
}

