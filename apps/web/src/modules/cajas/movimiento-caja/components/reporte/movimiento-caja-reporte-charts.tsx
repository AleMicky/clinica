"use client";

import * as React from "react";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Tag,
  Building2,
  Calendar,
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
import type { MovimientoCajaMetricsResponse } from "../../types/movimiento-caja.types";

interface MovimientoCajaReporteChartsProps {
  metrics: MovimientoCajaMetricsResponse | undefined;
  isLoading: boolean;
}

const PALETTE = [
  "#10b981", // Emerald
  "#0284c7", // Sky blue
  "#f43f5e", // Rose
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
    const monthNames = [
      "ene", "feb", "mar", "abr", "may", "jun",
      "jul", "ago", "sep", "oct", "nov", "dic",
    ];
    const mIdx = Number.parseInt(month, 10) - 1;
    return `${Number.parseInt(day, 10)} ${monthNames[mIdx] || ""}`;
  }
  return dateStr;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      fecha: string;
      ingresos: number;
      egresos: number;
      balance: number;
      cantidad: number;
    };
  }>;
}

function CustomTrendTooltip({ active, payload }: TrendTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border/60 rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-44">
      <div className="flex items-center gap-1.5 font-bold text-foreground border-b border-border/40 pb-1">
        <Calendar className="size-3 text-muted-foreground" />
        <span>{data.fecha}</span>
        <span className="ml-auto text-[10px] text-muted-foreground font-normal">
          ({data.cantidad} ops)
        </span>
      </div>
      <div className="space-y-1 font-mono text-[11px]">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span>Ingresos:</span>
          <strong>+Bs. {data.ingresos.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
          <span>Egresos:</span>
          <strong>-Bs. {data.egresos.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border/40 font-bold text-foreground">
          <span>Balance:</span>
          <strong className={data.balance >= 0 ? "text-emerald-600" : "text-rose-600"}>
            {data.balance >= 0 ? "+" : ""}
            Bs. {data.balance.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
          </strong>
        </div>
      </div>
    </div>
  );
}

export function MovimientoCajaReporteCharts({
  metrics,
  isLoading,
}: Readonly<MovimientoCajaReporteChartsProps>) {
  const tendenciaDiaria = metrics?.tendenciaDiaria ?? [];
  const porTipo = metrics?.porTipoMovimiento ?? [];
  const porConcepto = metrics?.porConcepto ?? [];
  const porCaja = metrics?.porCaja ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-card/50 border border-border/40 animate-pulse" />
        <div className="h-72 rounded-2xl bg-card/50 border border-border/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chart 1: Flujo Diario de Efectivo (Ingresos vs Egresos) */}
      <div className="lg:col-span-2 bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Flujo Diario de Efectivo (Entradas vs Salidas)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Comparativo día a día de ingresos y egresos registrados en Bs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500" />
              Ingresos
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="size-2 rounded-full bg-rose-500" />
              Egresos
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          {tendenciaDiaria.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              No hay datos suficientes para mostrar el gráfico en el rango seleccionado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendenciaDiaria} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ingresosGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="egresosGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={formatDateTick}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                  tickFormatter={(val) => `Bs.${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#ingresosGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="egresos"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#egresosGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Distribución por Tipo de Movimiento */}
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <PieChartIcon className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Por Tipo de Movimiento
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Participación en volumen de efectivo
              </p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full flex flex-col items-center justify-center">
          {porTipo.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              Sin movimientos registrados
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={porTipo}
                      dataKey="monto"
                      nameKey="tipoNombre"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {porTipo.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.tipoNombre}`}
                          fill={PALETTE[index % PALETTE.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: unknown) => [
                        `Bs. ${Number(value ?? 0).toLocaleString("es-BO", { minimumFractionDigits: 2 })}`,
                        "Monto",
                      ]}
                      contentStyle={{
                        borderRadius: "10px",
                        fontSize: "11px",
                        padding: "6px 10px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mini Legend List */}
              <div className="flex-1 overflow-y-auto max-h-24 pr-1 space-y-1 mt-1 text-[11px]">
                {porTipo.map((item, idx) => (
                  <div key={item.tipoNombre} className="flex items-center justify-between gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                      />
                      <span className="truncate">{item.tipoNombre}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono shrink-0">
                      <span>{item.porcentaje}%</span>
                      <strong className="text-foreground">Bs. {item.monto.toLocaleString("es-BO", { maximumFractionDigits: 0 })}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Top Conceptos & Flujo por Caja */}
      {porConcepto.length > 0 && (
        <div className="lg:col-span-2 bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-border/30">
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Tag className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Top Conceptos de Movimiento
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Principales motivos por los que entra o sale dinero de caja
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {porConcepto.slice(0, 6).map((concepto) => {
              const isEntrada = concepto.naturaleza.toUpperCase() === "ENTRADA";
              return (
                <div
                  key={concepto.conceptoNombre}
                  className="p-3 rounded-xl bg-muted/20 border border-border/30 flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full shrink-0 ${isEntrada ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span className="text-xs font-semibold text-foreground truncate">
                        {concepto.conceptoNombre}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {concepto.tipoNombre} • {concepto.cantidad} operaciones
                    </span>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className={`text-xs font-bold ${isEntrada ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {isEntrada ? "+" : "-"}Bs. {concepto.monto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {concepto.porcentaje}% del volumen
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Row 2 Right: Flujo por Caja */}
      {porCaja.length > 0 && (
        <div className={`${porConcepto.length > 0 ? "lg:col-span-1" : "lg:col-span-3"} bg-card/90 backdrop-blur-sm rounded-2xl border border-border/40 p-5 shadow-xs`}>
          <div className="flex items-center gap-2 pb-3 border-b border-border/30">
            <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Balance por Terminal de Caja
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Flujo neto registrado en cada caja
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-4">
            {porCaja.map((caja) => (
              <div key={caja.cajaNombre} className="p-2.5 rounded-xl bg-muted/20 border border-border/30 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground truncate">{caja.cajaNombre}</span>
                  <span className={`font-mono font-bold ${caja.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {caja.balance >= 0 ? "+" : ""}Bs. {caja.balance.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span className="text-emerald-600">Entradas: Bs. {caja.ingresos.toLocaleString("es-BO")}</span>
                  <span className="text-rose-600">Salidas: Bs. {caja.egresos.toLocaleString("es-BO")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
