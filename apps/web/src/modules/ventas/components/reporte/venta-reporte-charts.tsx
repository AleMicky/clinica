"use client";

import * as React from "react";
import {
  TrendingUp,
  Award,
  Users,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { VentaMetrics } from "../../types/ventas.types";
import { cn } from "@/lib/utils";

interface VentaReporteChartsProps {
  metrics: VentaMetrics | undefined;
  isLoading: boolean;
}

function formatDateTick(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [, month, day] = parts;
    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const mIdx = Number.parseInt(month, 10) - 1;
    return `${Number.parseInt(day, 10)} ${monthNames[mIdx] || ""}`;
  }
  return dateStr;
}

interface CustomTrendTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      fecha: string;
      monto: number;
      cantidad: number;
    };
  }>;
}

function CustomTrendTooltip({
  active,
  payload,
}: CustomTrendTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border/80 px-3 py-2 rounded-xl shadow-lg text-xs space-y-1">
      <div className="font-semibold text-foreground border-b border-border/40 pb-1 flex items-center justify-between gap-4">
        <span>{formatDateTick(data.fecha)}</span>
        <span className="text-[11px] font-mono text-muted-foreground">
          {data.cantidad} {data.cantidad === 1 ? "venta" : "ventas"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <span className="text-muted-foreground text-[11px]">Facturación:</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
          Bs. {data.monto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

export function VentaReporteCharts({
  metrics,
  isLoading,
}: Readonly<VentaReporteChartsProps>) {
  const [activeTab, setActiveTab] = React.useState<"servicios" | "vendedores">("servicios");

  const tendencia = metrics?.tendenciaDiaria ?? [];
  const topServicios = metrics?.topServicios ?? [];
  const topVendedores = metrics?.topVendedores ?? [];
  const montoTotal = metrics?.montoTotal ?? 0;
  const total = metrics?.totalVentas ?? 0;

  // Max value calculation for progress bars
  const maxServicioTotal = React.useMemo(() => {
    return Math.max(...topServicios.map((s) => s.total), 1);
  }, [topServicios]);

  const maxVendedorTotal = React.useMemo(() => {
    return Math.max(...topVendedores.map((v) => v.totalVendido), 1);
  }, [topVendedores]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div className="h-64 bg-muted/20 rounded-2xl border border-border/30 animate-pulse lg:col-span-2" />
        <div className="h-64 bg-muted/20 rounded-2xl border border-border/30 animate-pulse" />
      </div>
    );
  }

  if (total === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
      {/* 1. Gráfico de Tendencia Temporal de Ventas en Bs. */}
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4 shadow-xs lg:col-span-2 flex flex-col justify-between transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="size-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Tendencia de Ingresos por Ventas
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Evolución cronológica de facturación en Bolivianos (Bs.)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Bs. {montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-3">
            {tendencia.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                No hay datos cronológicos suficientes para el rango seleccionado.
              </div>
            ) : tendencia.length === 1 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2 text-center p-4">
                <Activity className="size-8 text-emerald-500/60" />
                <span className="text-sm font-bold text-foreground">
                  Día único: {formatDateTick(tendencia[0].fecha)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tendencia[0].cantidad} transacciones por un total de{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    Bs. {tendencia[0].monto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </span>
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={tendencia}
                    margin={{ top: 8, right: 12, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={formatDateTick}
                      tick={{ fontSize: 10, fill: "currentColor" }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={{ opacity: 0.2 }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "currentColor" }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `Bs.${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip content={<CustomTrendTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="monto"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#ventasGradient)"
                      activeDot={{ r: 5, fill: "#10B981", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Puntos de corte registrados: <strong className="text-foreground">{tendencia.length}</strong></span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 inline-block" />
            Ingresos netos por día
          </span>
        </div>
      </div>

      {/* 2. Top Ventas por Servicios y por Vendedores */}
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-4 shadow-xs flex flex-col justify-between transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Award className="size-4.5" />
              </div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Líderes Comerciales
              </h3>
            </div>

            {/* Toggle Tab */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/40 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab("servicios")}
                className={cn(
                  "px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer",
                  activeTab === "servicios"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Servicios
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("vendedores")}
                className={cn(
                  "px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer",
                  activeTab === "vendedores"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Vendedores
              </button>
            </div>
          </div>

          <div className="pt-3 space-y-2.5">
            {activeTab === "servicios" ? (
              topServicios.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-xs text-muted-foreground text-center">
                  <Layers className="size-6 text-muted-foreground/50 mb-1" />
                  <span>Sin servicios registrados en el período.</span>
                </div>
              ) : (
                topServicios.map((srv, idx) => {
                  const percent = Math.min(Math.round((srv.total / maxServicioTotal) * 100), 100);
                  return (
                    <div key={`srv-${srv.servicioId}-${idx}`} className="space-y-1">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-bold font-mono size-4.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-foreground truncate" title={srv.nombre}>
                            {srv.nombre}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-foreground font-mono">
                            Bs. {srv.total.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">
                            ({srv.cantidad} u.)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )
            ) : topVendedores.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-xs text-muted-foreground text-center">
                <Users className="size-6 text-muted-foreground/50 mb-1" />
                <span>Sin datos de vendedores en el período.</span>
              </div>
            ) : (
              topVendedores.map((vend, idx) => {
                const percent = Math.min(Math.round((vend.totalVendido / maxVendedorTotal) * 100), 100);
                return (
                  <div key={`vend-${vend.vendedorId}-${idx}`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-bold font-mono size-4.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-foreground truncate" title={vend.nombre}>
                          {vend.nombre}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-foreground font-mono">
                          Bs. {vend.totalVendido.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">
                          ({vend.cantidadVentas} vtas.)
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-2.5 border-t border-border/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Ranking Top 5</span>
          <span className="text-foreground/80 font-medium">Basado en volumen facturado</span>
        </div>
      </div>
    </div>
  );
}
