"use client";

import * as React from "react";
import { BarChart3, ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Rectangle,
  Sector,
  type BarShapeProps,
  type PieSectorShapeProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdmisionMetrics } from "../../types/admision.types";

interface AdmisionReporteChartsProps {
  metrics: AdmisionMetrics | undefined;
  isLoading: boolean;
}

const PIE_COLORS = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#06B6D4"];

export function AdmisionReporteCharts({
  metrics,
  isLoading,
}: AdmisionReporteChartsProps) {
  const registradas = metrics?.registradas ?? 0;
  const confirmadas = metrics?.confirmadas ?? 0;
  const enviadasVenta = metrics?.enviadasVenta ?? 0;
  const canceladas = metrics?.canceladas ?? 0;
  const total = metrics?.total ?? metrics?.totalHoy ?? 0;

  const statusChartData = React.useMemo(() => {
    return [
      { name: "Registradas", cantidad: registradas, color: "#3B82F6" },
      { name: "Confirmadas", cantidad: confirmadas, color: "#10B981" },
      { name: "Enviadas Venta", cantidad: enviadasVenta, color: "#8B5CF6" },
      { name: "Canceladas", cantidad: canceladas, color: "#F43F5E" },
    ];
  }, [registradas, confirmadas, enviadasVenta, canceladas]);

  const convenioChartData = React.useMemo(() => {
    if (!metrics?.topConvenios || metrics.topConvenios.length === 0) {
      return [];
    }
    return metrics.topConvenios.map((c) => ({
      name: c.nombre || "Particular",
      value: c.cantidad,
    }));
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="h-44 bg-muted/30 rounded-xl border border-border/50 animate-pulse lg:col-span-2" />
        <div className="h-44 bg-muted/30 rounded-xl border border-border/50 animate-pulse" />
      </div>
    );
  }

  if (total === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
      {/* Chart 1: Distribución por Estado */}
      <Card className="border border-border/70 bg-card shadow-2xs lg:col-span-2">
        <CardHeader className="py-2.5 px-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="size-3.5 text-primary" />
              <CardTitle className="text-xs font-bold text-foreground">
                Volumen Total por Estado (Datos del Servidor)
              </CardTitle>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {total} admisiones
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-2.5 pt-3">
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Bar
                  dataKey="cantidad"
                  radius={[4, 4, 0, 0]}
                  shape={(props: BarShapeProps) => (
                    <Rectangle
                      {...props}
                      radius={[4, 4, 0, 0]}
                      fill={statusChartData[props.index]?.color ?? props.fill}
                    />
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Top Coberturas / Convenios */}
      <Card className="border border-border/70 bg-card shadow-2xs">
        <CardHeader className="py-2.5 px-3 border-b border-border/40">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-xs font-bold text-foreground">
              Top Coberturas Médicas
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-2.5 pt-3">
          {convenioChartData.length > 0 ? (
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={convenioChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={46}
                    label={({ percent }: { percent?: number }) =>
                      `${(((percent ?? 0) * 100)).toFixed(0)}%`
                    }
                    labelLine={false}
                    shape={(props: PieSectorShapeProps) => (
                      <Sector
                        {...props}
                        fill={PIE_COLORS[(props.index ?? 0) % PIE_COLORS.length]}
                      />
                    )}
                  />
                  <Tooltip
                    formatter={(value: unknown, name: unknown) => [
                      `${value} admisiones`,
                      String(name),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
              Sin datos de coberturas para el filtro
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
