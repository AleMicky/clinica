"use client";

import { MetricCard } from "@/components/shared";
import { CheckCircle2, Clock, DollarSign, FileSpreadsheet, XCircle } from "lucide-react";
import type { VentaMetrics } from "../types/ventas.types";

interface VentaMetricsCardsProps {
  metrics: VentaMetrics;
}

export function VentaMetricsCards({ metrics }: VentaMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
      <MetricCard
        title="Total Ventas"
        value={metrics.totalVentas}
        icon={FileSpreadsheet}
        description="Comprobantes registrados"
      />

      <MetricCard
        title="Pendientes"
        value={metrics.pendientes}
        icon={Clock}
        description="Cobro por regularizar"
      />

      <MetricCard
        title="Pagadas"
        value={metrics.pagadas}
        icon={CheckCircle2}
        description="Ventas completadas"
      />

      <MetricCard
        title="Anuladas"
        value={metrics.anuladas}
        icon={XCircle}
        description="Comprobantes anulados"
      />

      <MetricCard
        title="Monto Total Recaudado"
        value={`S/. ${metrics.montoTotal.toFixed(2)}`}
        icon={DollarSign}
        description="Suma total abonada"
      />
    </div>
  );
}
