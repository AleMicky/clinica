"use client";

import * as React from "react";
import {
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  Coins,
  Store,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { CobroMetrics } from "../../types/cobro.types";
import { cn } from "@/lib/utils";

interface CobroReporteChartsProps {
  metrics: CobroMetrics | undefined;
  isLoading: boolean;
}

const PALETTE = [
  "#6366f1", // Indigo
  "#0284c7", // Sky blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#f97316", // Orange
];

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
          {data.cantidad} {data.cantidad === 1 ? "cobro" : "cobros"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <span className="text-muted-foreground text-[11px]">Recaudado:</span>
        <span className="font-bold text-sky-600 dark:text-sky-400 font-mono">
          Bs. {data.monto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      monto: number;
      cantidad: number;
      percentage: number;
      color: string;
    };
  }>;
}

function CustomPieTooltip({ active, payload }: CustomPieTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border/80 px-3 py-2 rounded-xl shadow-lg text-xs space-y-1 z-50">
      <div className="font-semibold text-foreground border-b border-border/40 pb-1 flex items-center gap-2">
        <span
          className="size-2 rounded-full shrink-0"
          style={{ backgroundColor: data.color }}
        />
        <span className="truncate max-w-[180px]">{data.name}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-[11px] pt-0.5">
        <span className="text-muted-foreground">Recaudado:</span>
        <span className="font-bold text-foreground font-mono">
          Bs. {data.monto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <span className="text-muted-foreground">Operaciones:</span>
        <span className="font-medium text-foreground font-mono">
          {data.cantidad} {data.cantidad === 1 ? "cobro" : "cobros"} ({data.percentage.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}

export function CobroReporteCharts({
  metrics,
  isLoading,
}: Readonly<CobroReporteChartsProps>) {
  const [activeTab, setActiveTab] = React.useState<"metodos" | "cajas">("metodos");

  const tendencia = metrics?.tendenciaDiaria ?? [];
  const metodosPago = metrics?.metodosPago ?? [];
  const porCaja = metrics?.porCaja ?? [];
  const montoTotal = metrics?.totalMontoCobrado ?? 0;

  const chartData = React.useMemo(() => {
    if (activeTab === "metodos") {
      return metodosPago.map((item, idx) => {
        const pct = item.porcentaje ?? (montoTotal > 0 ? (item.monto / montoTotal) * 100 : 0);
        return {
          id: `metodo-${idx}`,
          name: item.metodoPago,
          monto: item.monto,
          cantidad: item.cantidad,
          percentage: pct,
          color: PALETTE[idx % PALETTE.length],
        };
      });
    }
    return porCaja.map((item, idx) => {
      const pct = montoTotal > 0 ? (item.monto / montoTotal) * 100 : 0;
      return {
        id: `caja-${idx}`,
        name: item.cajaNombre,
        monto: item.monto,
        cantidad: item.cantidad,
        percentage: pct,
        color: PALETTE[idx % PALETTE.length],
      };
    });
  }, [activeTab, metodosPago, porCaja, montoTotal]);

  const totalCategoria = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.monto, 0);
  }, [chartData]);

  const totalCobrosCategoria = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.cantidad, 0);
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0">
        <div className="lg:col-span-7 bg-card rounded-2xl border border-border/40 p-5 h-80 animate-pulse flex items-center justify-center text-muted-foreground text-xs">
          Cargando gráfica de tendencia...
        </div>
        <div className="lg:col-span-5 bg-card rounded-2xl border border-border/40 p-5 h-80 animate-pulse flex items-center justify-center text-muted-foreground text-xs">
          Cargando desglose de recaudación...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0">
      {/* 1. Daily Trend Chart (7 cols) */}
      <div className="lg:col-span-7 bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Tendencia Diaria de Cobranzas
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Comportamiento de la recaudación monetaria por fecha
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
            Bs. {montoTotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="w-full h-56 min-w-0">
          {tendencia.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
              <Calendar className="size-6 text-muted-foreground/50" />
              <span>No hay registros confirmados en el período seleccionado</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendencia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cobroAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={formatDateTick}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border) / 0.5)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="monto"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cobroAreaGradient)"
                  activeDot={{ r: 5, fill: "#0284c7", stroke: "#ffffff", strokeWidth: 2 }}
                  dot={tendencia.length <= 1 ? { r: 4, fill: "#0284c7" } : false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Breakdown Panel (5 cols) */}
      <div className="lg:col-span-5 bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-5 shadow-xs flex flex-col justify-between transition-all">
        <div className="space-y-3.5">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Layers className="size-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider truncate">
                  Distribución de Recaudación
                </h3>
                <p className="text-[10px] text-muted-foreground truncate">
                  {activeTab === "metodos" ? "Participación por forma de pago" : "Rendimiento por terminal de caja"}
                </p>
              </div>
            </div>

            {/* Pill Switcher */}
            <div className="inline-flex items-center p-0.5 bg-muted/60 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("metodos")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1",
                  activeTab === "metodos"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CreditCard className="size-3" />
                <span>Formas de Pago</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cajas")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1",
                  activeTab === "cajas"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Store className="size-3" />
                <span>Por Caja</span>
              </button>
            </div>
          </div>

          {/* If no data */}
          {chartData.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2 border border-dashed border-border/50 rounded-xl bg-muted/10 p-4 text-center">
              <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground/60">
                {activeTab === "metodos" ? <Coins className="size-5" /> : <Building2 className="size-5" />}
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground text-xs">
                  Sin datos en este período
                </p>
                <p className="text-[11px] text-muted-foreground max-w-[220px]">
                  {activeTab === "metodos"
                    ? "No hay formas de pago registradas para los filtros activos."
                    : "No hay movimientos por caja registrados en este rango de fechas."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Visual Donut Chart + Top Summary Card */}
              <div className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-xl border border-border/40">
                <div className="size-24 shrink-0 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={chartData}
                        dataKey="monto"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={44}
                        paddingAngle={chartData.length > 1 ? 3 : 0}
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      >
                        {chartData.map((entry) => (
                          <Cell key={entry.id} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center badge in donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                      {activeTab === "metodos" ? "Formas" : "Cajas"}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-foreground leading-tight mt-0.5">
                      {chartData.length}
                    </span>
                  </div>
                </div>

                {/* KPI Summary Block */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                      Recaudación {activeTab === "metodos" ? "por Métodos" : "por Cajas"}
                    </span>
                    <span className="text-base font-bold font-mono text-foreground leading-snug">
                      Bs. {totalCategoria.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                    <span className="bg-background/80 px-2 py-0.5 rounded-md border border-border/50 font-medium text-foreground text-[10px]">
                      {totalCobrosCategoria} {totalCobrosCategoria === 1 ? "cobro confirmado" : "cobros confirmados"}
                    </span>
                    {totalCobrosCategoria > 0 && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        (Prom: Bs. {(totalCategoria / totalCobrosCategoria).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List Breakdown */}
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                {chartData.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-card/60 hover:bg-muted/40 border border-border/30 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className="size-2 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: item.color }}
                          />
                          <span
                            className="font-semibold text-foreground truncate text-xs"
                            title={item.name}
                          >
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {item.cantidad} {item.cantidad === 1 ? "cobro" : "cobros"}
                          </span>
                          <span className="font-bold text-foreground font-mono text-xs">
                            Bs. {item.monto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded-md font-mono"
                            style={{
                              backgroundColor: `${item.color}18`,
                              color: item.color,
                            }}
                          >
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Smooth Progress Bar */}
                      <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(Math.max(item.percentage, 2), 100)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/30 flex items-center justify-between mt-3">
          <span className="flex items-center gap-1.5">
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
            </span>
            Actualizado en tiempo real
          </span>
          <span className="font-semibold text-foreground">
            {activeTab === "metodos"
              ? metodosPago.length === 1
                ? "1 forma de pago registrada"
                : `${metodosPago.length} formas de pago registradas`
              : porCaja.length === 1
                ? "1 terminal de caja activa"
                : `${porCaja.length} terminales de caja activas`}
          </span>
        </div>
      </div>
    </div>
  );
}
