"use client";

import * as React from "react";
import { TrendingUp, Calendar } from "lucide-react";
import { MetricCard, CurrencyConverterCard } from "@/components/shared";

interface TipoCambioMetricsProps {
  ultimaTasa?: string;
  parOriginal?: string;
  tasaCompraPromedio?: string;
  totalRegistros?: number;
  ultimaFecha?: string;
  isLoading?: boolean;
}

export function TipoCambioMetricsCards({
  ultimaTasa = "-",
  parOriginal = "Sin cotización",
  tasaCompraPromedio = "-",
  totalRegistros = 0,
  ultimaFecha = "-",
  isLoading = false,
}: TipoCambioMetricsProps) {
  const numericRate = parseFloat(ultimaTasa);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calculadora de Conversión Rápida Centralizada */}
      <CurrencyConverterCard
        className="lg:col-span-1"
        initialRate={!isNaN(numericRate) && numericRate > 0 ? numericRate : 1.0}
      />

      {/* Métricas Diarias Centralizadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-2 gap-4">
        <MetricCard
          title="Última Tasa Registrada"
          value={ultimaTasa}
          description={parOriginal}
          icon={TrendingUp}
          iconClassName="text-green-600"
          isLoading={isLoading}
        />

        <MetricCard
          title="Tasa Compra Promedio"
          value={tasaCompraPromedio}
          description="Cotización de compra"
          icon={TrendingUp}
          iconClassName="text-primary"
          isLoading={isLoading}
        />

        <MetricCard
          title="Total Registros"
          value={totalRegistros}
          description="Tasas de cambio guardadas"
          icon={TrendingUp}
          iconClassName="text-blue-500"
          isLoading={isLoading}
          isMono={false}
        />

        <MetricCard
          title="Última Fecha"
          value={ultimaFecha}
          description="Fecha del último registro"
          icon={Calendar}
          iconClassName="text-amber-500"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
