"use client";

import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown, Coins, FileSpreadsheet, Plus, RefreshCw } from "lucide-react";
import { ROUTES } from "@/config/routes";

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

interface VentaHeaderProps {
  onAddClick: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
  onDateRangeChange?: (desde: string, hasta: string) => void;
  onFechaDesdeChange?: (value: string) => void;
  onFechaHastaChange?: (value: string) => void;
}

export function VentaHeader({
  onAddClick,
  onRefresh,
  isRefreshing = false,
  fechaDesde,
  fechaHasta,
  onDateRangeChange,
  onFechaDesdeChange,
  onFechaHastaChange,
}: Readonly<VentaHeaderProps>) {
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-card via-card to-primary/5 px-4 py-2.5 rounded-xl border border-border/70 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="size-8.5 rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-blue-500/20 text-primary flex items-center justify-center border border-primary/20 shadow-2xs shrink-0">
          <Coins className="size-4.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground tracking-tight">
              Ventas y Facturación
            </h1>
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.2 rounded-full border border-primary/20">
              Caja / Cobros
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            Gestión de comprobantes, cobros de atención y distribución por pagadores.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
        {/* Selector de Fecha Elegante y Compacto */}
        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-md border h-8 px-2.5 text-xs font-medium gap-1.5 transition-all cursor-pointer shadow-2xs select-none",
              !isAllActive
                ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15 hover:text-primary dark:bg-primary/15"
                : "bg-background border-border/80 text-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            title="Filtrar por período"
          >
            <Calendar className="size-3.5 text-primary" />
            <span className="font-semibold">
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
                Período de Ventas
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
                <label htmlFor="vh-popover-fecha-desde" className="text-[11px] font-semibold text-muted-foreground block">
                  Desde:
                </label>
                <DatePicker
                  id="vh-popover-fecha-desde"
                  value={fechaDesde || ""}
                  onChange={(val) => onFechaDesdeChange?.(val)}
                  placeholder="DD/MM/AAAA"
                  allowClear
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="vh-popover-fecha-hasta" className="text-[11px] font-semibold text-muted-foreground block">
                  Hasta:
                </label>
                <DatePicker
                  id="vh-popover-fecha-hasta"
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

        <Link
          href={ROUTES.VENTAS.REPORTES}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 px-2.5 text-xs gap-1.5 border-border/80 hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
          )}
          title="Ver reporte general y exportación oficial a Excel"
        >
          <FileSpreadsheet className="size-3.5 text-teal-600 dark:text-teal-400" />
          <span className="hidden sm:inline">Reportes</span>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-8 px-2.5 text-xs gap-1.5 border-border/80 hover:bg-accent hover:text-accent-foreground transition-all"
          title="Actualizar datos"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden md:inline">Actualizar</span>
        </Button>

        <Button
          size="sm"
          onClick={onAddClick}
          className="h-8 px-3.5 text-xs font-semibold gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-xs shadow-primary/20 transition-all duration-200"
        >
          <Plus className="size-3.5" />
          <span>Nueva Venta</span>
        </Button>
      </div>
    </div>
  );
}
