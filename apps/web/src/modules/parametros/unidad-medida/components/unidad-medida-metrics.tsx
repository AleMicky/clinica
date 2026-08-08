"use client";

import * as React from "react";
import { Scale, Pill, FlaskConical, Tag } from "lucide-react";
import type { UnidadMedidaMetrics } from "../types/unidad-medida.types";

interface UnidadMedidaMetricsProps {
  metrics: UnidadMedidaMetrics;
}

export function UnidadMedidaMetricsCards({ metrics }: UnidadMedidaMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-muted/20 p-2.5 rounded-lg border">
      <div className="flex items-center gap-2.5 px-2 py-1">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
          <Scale className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Total Unidades</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.totalUnidades}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 sm:border-l sm:border-border/60">
        <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
          <Pill className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Dosificación / Farmacia</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.dosificacionCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 lg:border-l lg:border-border/60">
        <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          <FlaskConical className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Volumen y Peso</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.volumenPesoCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-2 py-1 lg:border-l lg:border-border/60">
        <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
          <Tag className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground truncate">Categorías Activas</p>
          <p className="text-base font-bold text-foreground leading-tight">{metrics.categoriasCount}</p>
        </div>
      </div>
    </div>
  );
}

