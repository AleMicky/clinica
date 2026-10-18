"use client";

import * as React from "react";
import { BarChart3, ShieldCheck, PieChart as PieChartIcon } from "lucide-react";
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
  CartesianGrid,
  type BarShapeProps,
  type PieSectorShapeProps,
} from "recharts";
import type { AdmisionMetrics } from "../../types/admision.types";

interface AdmisionReporteChartsProps {
  metrics: AdmisionMetrics | undefined;
  isLoading: boolean;
}

const PIE_COLORS = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#06B6D4", "#EC4899"];

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div className="h-48 bg-muted/20 rounded-2xl border border-border/30 animate-pulse lg:col-span-2" />
        <div className="h-48 bg-muted/20 rounded-2xl border border-border/30 animate-pulse" />
      </div>
    );
  }

  if (total === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 w-full min-w-0">
      {/* Chart 1: Distribución por Estado */}
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4 shadow-xs lg:col-span-2 transition-all min-w-0">
        <div className="flex items-center justify-between pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">
                Distribución de Admisiones por Estado
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Volumen acumulado evaluado en el período
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold font-mono bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md">
            {total} totales
          </span>
        </div>

        <div className="pt-3">
          <div className="h-36 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ opacity: 0.2 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "currentColor", opacity: 0.04 }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                    padding: "6px 12px",
                  }}
                />
                <Bar
                  dataKey="cantidad"
                  radius={[6, 6, 0, 0]}
                  shape={(props: BarShapeProps) => (
                    <Rectangle
                      {...props}
                      radius={[6, 6, 0, 0]}
                      fill={statusChartData[props.index]?.color ?? props.fill}
                    />
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 2: Top Coberturas / Convenios */}
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4 shadow-xs transition-all min-w-0">
        <div className="flex items-center justify-between pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">
                Top Coberturas Médicas
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Participación por aseguradora
              </p>
            </div>
          </div>
          <PieChartIcon className="size-4 text-muted-foreground/60" />
        </div>

        <div className="pt-3">
          {convenioChartData.length > 0 ? (
            <div className="h-36 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={convenioChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={52}
                    paddingAngle={3}
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
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                      padding: "6px 12px",
                    }}
                    formatter={(value: unknown, name: unknown) => [
                      `${value} admisiones`,
                      String(name),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center text-xs text-muted-foreground gap-1">
              <ShieldCheck className="size-6 text-muted-foreground/40" />
              <span>Sin desglose de convenios en el período</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

