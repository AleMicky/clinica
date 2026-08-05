"use client";

import * as React from "react";
import { Star, Coins, Globe } from "lucide-react";
import { MetricCard } from "@/components/shared";
import type { MonedaMetrics } from "../types/moneda.types";

interface MonedaMetricsProps {
  metrics: MonedaMetrics;
}

export function MonedaMetricsCards({ metrics }: MonedaMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Moneda Principal"
        value={metrics.monedaBase}
        description="Moneda base del sistema"
        icon={Star}
        iconClassName="text-amber-500 fill-amber-500"
      />

      <MetricCard
        title="Monedas Habilitadas"
        value={metrics.monedasHabilitadas}
        description="Disponibles en cobros"
        icon={Coins}
        iconClassName="text-primary"
        isMono={false}
      />

      <MetricCard
        title="Facturación Multimoneda"
        value={metrics.facturacionMultimoneda ? "Activa" : "Inactiva"}
        description="Conversión en tiempo real"
        icon={Globe}
        iconClassName="text-green-500"
        isMono={false}
      />

      <MetricCard
        title="Monedas Inactivas"
        value={metrics.monedasInactivas}
        description="Fuera de circulación local"
        icon={Coins}
        iconClassName="text-muted-foreground"
        isMono={false}
      />
    </div>
  );
}
