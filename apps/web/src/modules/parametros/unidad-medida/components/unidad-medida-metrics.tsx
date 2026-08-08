"use client";

import * as React from "react";
import { Scale, Pill, FlaskConical, Tag } from "lucide-react";
import { MetricCard } from "@/components/shared";
import type { UnidadMedidaMetrics } from "../types/unidad-medida.types";

interface UnidadMedidaMetricsProps {
  metrics: UnidadMedidaMetrics;
}

export function UnidadMedidaMetricsCards({ metrics }: UnidadMedidaMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Unidades"
        value={metrics.totalUnidades}
        description="Magnitudes estándar registradas"
        icon={Scale}
        iconClassName="text-primary"
        isMono={false}
      />

      <MetricCard
        title="Dosificación / Farmacia"
        value={metrics.dosificacionCount}
        description="mg, UI, cápsulas, etc."
        icon={Pill}
        iconClassName="text-blue-500"
        isMono={false}
      />

      <MetricCard
        title="Volumen y Peso"
        value={metrics.volumenPesoCount}
        description="ml, L, kg, g, etc."
        icon={FlaskConical}
        iconClassName="text-green-500"
        isMono={false}
      />

      <MetricCard
        title="Categorías"
        value={metrics.categoriasCount}
        description="Grupos de medición activos"
        icon={Tag}
        iconClassName="text-amber-500"
        isMono={false}
      />
    </div>
  );
}
