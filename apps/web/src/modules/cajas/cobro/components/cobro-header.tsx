"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  Wallet,
  Clock,
  CheckCircle2,
  DollarSign,
  Calendar,
  ChevronDown,
} from "lucide-react";
import type { CobroMetrics as CobroMetricsType } from "../types/cobro.types";

function formatDisplayDate(isoStr?: string): string {
  if (!isoStr) return "";
  const cleanIso = isoStr.includes("T") ? isoStr.split("T")[0] : isoStr;
  const parts = cleanIso.split("-");
  if (parts.length !== 3) return isoStr;
  const [year, month, day] = parts;
  const monthNames = [
    "ene.", "feb.", "mar.", "abr.", "may.", "jun.",
    "jul.", "ago.", "sep.", "oct.", "nov.", "dic."
  ];
  const mIndex = Number.parseInt(month, 10) - 1;
  const mName = monthNames[mIndex] || month;
  return `${Number.parseInt(day, 10)} ${mName} ${year}`;
}

function getRangeLabel(
  desde?: string,
  hasta?: string,
  isToday?: boolean,
  isYesterday?: boolean,
  is7Days?: boolean,
  isMonth?: boolean,
  isAll?: boolean
): string {
  if (isToday) return `Hoy (${formatDisplayDate(desde)})`;
  if (isYesterday) return `Ayer (${formatDisplayDate(desde)})`;
  if (is7Days) return "Últimos 7 días";
  if (isMonth) return "Este mes";
  if (isAll) return "Todo el histórico";
  if (!desde && !hasta) return "Todo el histórico";
  if (desde && hasta && desde === hasta) {
    return formatDisplayDate(desde);
  }
  if (desde && hasta) {
    return `${formatDisplayDate(desde)} - ${formatDisplayDate(hasta)}`;
  }
  if (desde) return `Desde ${formatDisplayDate(desde)}`;
  if (hasta) return `Hasta ${formatDisplayDate(hasta)}`;
  return "Período";
}

interface CobroHeaderProps {
  metrics: CobroMetricsType;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
  onDateRangeChange?: (desde: string, hasta: string) => void;
  onFechaDesdeChange?: (value: string) => void;
  onFechaHastaChange?: (value: string) => void;
}

export function CobroHeader({
  metrics,
  onRefresh,
  isRefreshing = false,
  fechaDesde,
  fechaHasta,
  onDateRangeChange,
  onFechaDesdeChange,
  onFechaHastaChange,
}: Readonly<CobroHeaderProps>) {
  const [isDateOpen, setIsDateOpen] = React.useState(false);

  // Helper dates (ISO strings YYYY-MM-DD)
  const todayIso = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const yesterdayIso = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const last7DaysIso = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const monthStartIso = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  }, []);

  const isTodayActive = fechaDesde === todayIso && fechaHasta === todayIso;
  const isYesterdayActive = fechaDesde === yesterdayIso && fechaHasta === yesterdayIso;
  const is7DaysActive = fechaDesde === last7DaysIso && fechaHasta === todayIso;
  const isMonthActive = fechaDesde === monthStartIso && fechaHasta === todayIso;
  const isAllActive = !fechaDesde && !fechaHasta;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 pb-1">
      {/* Título y Badge POS */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
          <Wallet className="size-4" />
        </div>
        <div className="min-w-0 flex items-center gap-2">
          <h1 className="text-base font-bold tracking-tight text-foreground truncate">
            Caja & Cobros
          </h1>
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Terminal POS
          </span>
        </div>
      </div>

      {/* Métricas Integradas en Línea y Acciones (Filtro Fecha y Actualizar) */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-hidden flex-wrap sm:flex-nowrap">
        <div className="inline-flex items-center gap-2 px-2 py-1 sm:px-2.5 rounded-lg bg-card border border-border/70 text-xs shadow-2xs overflow-x-auto scrollbar-none max-w-full">
          <div className="flex items-center gap-1.5 pr-2 border-r border-border/50 shrink-0">
            <Clock className="size-3 text-amber-500 shrink-0" />
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">Por Cobrar:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
              {metrics.pendientesCobro}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pr-2 border-r border-border/50 shrink-0">
            <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">Cobrados:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.completados}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <DollarSign className="size-3 text-emerald-500 shrink-0" />
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">Total:</span>
            <span className="font-extrabold text-foreground font-mono">
              Bs. {metrics.totalMontoCobrado.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Selector de Rango de Fecha */}
        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-md border h-7 px-2.5 text-xs font-medium gap-1.5 transition-all cursor-pointer shadow-2xs select-none shrink-0",
              !isAllActive
                ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15 hover:text-primary dark:bg-primary/15"
                : "bg-background border-border/80 text-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            title="Filtrar por período de cobros"
          >
            <Calendar className="size-3 text-primary" />
            <span className="font-semibold text-[11px]">
              {getRangeLabel(
                fechaDesde,
                fechaHasta,
                isTodayActive,
                isYesterdayActive,
                is7DaysActive,
                isMonthActive,
                isAllActive
              )}
            </span>
            <ChevronDown className="size-3 opacity-60 ml-0.5" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className="w-[320px] p-3.5 space-y-3 bg-popover rounded-xl shadow-xl border border-border/80 text-xs z-50"
          >
            {/* Cabecera del popover */}
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5 text-primary" />
                Período de Cobros
              </span>
              {!isAllActive && (
                <button
                  type="button"
                  onClick={() => {
                    onDateRangeChange?.("", "");
                    setIsDateOpen(false);
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Ver Todo
                </button>
              )}
            </div>

            {/* Accesos rápidos en cuadrícula moderna */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onDateRangeChange?.(todayIso, todayIso);
                  setIsDateOpen(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer border select-none",
                  isTodayActive
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
                )}
              >
                ☀️ Hoy
              </button>
              <button
                type="button"
                onClick={() => {
                  onDateRangeChange?.(yesterdayIso, yesterdayIso);
                  setIsDateOpen(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer border select-none",
                  isYesterdayActive
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
                )}
              >
                ⏪ Ayer
              </button>
              <button
                type="button"
                onClick={() => {
                  onDateRangeChange?.(last7DaysIso, todayIso);
                  setIsDateOpen(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer border select-none",
                  is7DaysActive
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
                )}
              >
                📅 Últimos 7 días
              </button>
              <button
                type="button"
                onClick={() => {
                  onDateRangeChange?.(monthStartIso, todayIso);
                  setIsDateOpen(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer border select-none",
                  isMonthActive
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
                )}
              >
                🗓️ Este mes
              </button>
              <button
                type="button"
                onClick={() => {
                  onDateRangeChange?.("", "");
                  setIsDateOpen(false);
                }}
                className={cn(
                  "col-span-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center cursor-pointer border select-none",
                  isAllActive
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
                )}
              >
                🌐 Histórico Completo
              </button>
            </div>

            {/* Separador con texto */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-border/50 w-full" />
              <span className="bg-popover px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold absolute">
                Personalizado
              </span>
            </div>

            {/* Selectores Desde / Hasta */}
            <div className="space-y-2">
              <div className="space-y-1">
                <label htmlFor="ch-popover-fecha-desde" className="text-[11px] font-semibold text-muted-foreground block">
                  Desde:
                </label>
                <DatePicker
                  id="ch-popover-fecha-desde"
                  value={fechaDesde || ""}
                  onChange={(val) => onFechaDesdeChange?.(val)}
                  placeholder="DD/MM/AAAA"
                  allowClear
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="ch-popover-fecha-hasta" className="text-[11px] font-semibold text-muted-foreground block">
                  Hasta:
                </label>
                <DatePicker
                  id="ch-popover-fecha-hasta"
                  value={fechaHasta || ""}
                  onChange={(val) => onFechaHastaChange?.(val)}
                  placeholder="DD/MM/AAAA"
                  allowClear
                />
              </div>
            </div>

            {/* Footer de acciones */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => {
                  onDateRangeChange?.(todayIso, todayIso);
                  setIsDateOpen(false);
                }}
                className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
              >
                Restablecer a Hoy
              </button>
              <Button
                type="button"
                size="sm"
                className="h-7 text-xs px-3 cursor-pointer"
                onClick={() => setIsDateOpen(false)}
              >
                Aplicar
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-7 px-2 text-xs gap-1 cursor-pointer shadow-2xs font-medium shrink-0"
          >
            <RefreshCw
              className={`size-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden md:inline">Actualizar</span>
          </Button>
        )}
      </div>
    </div>
  );
}
