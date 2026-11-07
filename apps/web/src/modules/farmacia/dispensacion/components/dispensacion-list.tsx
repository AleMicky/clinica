"use client";

import * as React from "react";
import {
  Search,
  MoreVertical,
  Eye,
  Pencil,
  CheckCircle2,
  PackageCheck,
  Ban,
  Clock,
  Pill,
  CreditCard,
  User,
  RefreshCw,
  Building2,
  Stethoscope,
  Calendar,
  ChevronDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTablePagination } from "@/components/shared";
import { cn, formatDate } from "@/lib/utils";
import {
  type DispensacionResponse,
  type EstadoDispensacion,
  isEstadoPendientePago,
  isEstadoPagado,
  isEstadoEntregado,
  isEstadoAnulado,
} from "../types/dispensacion.types";
import type { AlmacenResponse } from "@/modules/almacenes/almacen/types/almacen.types";

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
    return `${formatDisplayDate(desde)} al ${formatDisplayDate(hasta)}`;
  }
  if (desde) return `Desde ${formatDisplayDate(desde)}`;
  if (hasta) return `Hasta ${formatDisplayDate(hasta)}`;
  return "Seleccionar período";
}

interface DispensacionDateFilterBarProps {
  readonly fechaDesde?: string;
  readonly fechaHasta?: string;
  readonly todayIso: string;
  readonly yesterdayIso: string;
  readonly last7DaysIso: string;
  readonly monthStartIso: string;
  readonly isTodayActive: boolean;
  readonly isYesterdayActive: boolean;
  readonly is7DaysActive: boolean;
  readonly isMonthActive: boolean;
  readonly isAllActive: boolean;
  readonly isCustomActive: boolean;
  readonly onDateRangeChange?: (desde: string, hasta: string) => void;
  readonly onFechaDesdeChange?: (value: string) => void;
  readonly onFechaHastaChange?: (value: string) => void;
}

function DispensacionDateFilterBar({
  fechaDesde,
  fechaHasta,
  todayIso,
  yesterdayIso,
  last7DaysIso,
  monthStartIso,
  isTodayActive,
  isYesterdayActive,
  is7DaysActive,
  isMonthActive,
  isAllActive,
  isCustomActive,
  onDateRangeChange,
  onFechaDesdeChange,
  onFechaHastaChange,
}: Readonly<DispensacionDateFilterBarProps>) {
  const [isCustomDateOpen, setIsCustomDateOpen] = React.useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-card border border-border/60 shadow-2xs">
      {/* Presets rápidos */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mr-1 shrink-0">
          <Calendar className="size-3 text-primary" />
          <span className="font-semibold text-foreground text-xs">Fecha:</span>
        </div>
        <button
          type="button"
          onClick={() => onDateRangeChange?.(todayIso, todayIso)}
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none",
            isTodayActive
              ? "bg-primary text-primary-foreground font-semibold shadow-xs shadow-primary/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => onDateRangeChange?.(yesterdayIso, yesterdayIso)}
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none",
            isYesterdayActive
              ? "bg-primary text-primary-foreground font-semibold shadow-xs shadow-primary/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Ayer
        </button>
        <button
          type="button"
          onClick={() => onDateRangeChange?.(last7DaysIso, todayIso)}
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none",
            is7DaysActive
              ? "bg-primary text-primary-foreground font-semibold shadow-xs shadow-primary/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Últimos 7 días
        </button>
        <button
          type="button"
          onClick={() => onDateRangeChange?.(monthStartIso, todayIso)}
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none",
            isMonthActive
              ? "bg-primary text-primary-foreground font-semibold shadow-xs shadow-primary/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Este mes
        </button>
        <button
          type="button"
          onClick={() => onDateRangeChange?.("", "")}
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none",
            isAllActive
              ? "bg-primary text-primary-foreground font-semibold shadow-xs shadow-primary/20"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Histórico (Todo)
        </button>
      </div>

      {/* Botón selector de Rango Personalizado con Popover */}
      <div className="flex items-center shrink-0">
        <Popover open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border select-none w-full sm:w-auto justify-between sm:justify-start",
              isCustomActive
                ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs shadow-primary/20"
                : "bg-background text-foreground border-border/70 hover:bg-muted/80 hover:text-foreground shadow-2xs"
            )}
          >
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3 text-primary shrink-0" />
              <span className="font-medium">
                {getRangeLabel(fechaDesde, fechaHasta, isTodayActive, isYesterdayActive, is7DaysActive, isMonthActive, isAllActive)}
              </span>
            </div>
            <ChevronDown className="size-3 opacity-60 ml-0.5 shrink-0" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className="w-[320px] p-3.5 space-y-3 bg-popover rounded-xl shadow-xl border border-border/80 text-xs"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5 text-primary" />
                Rango de Fechas
              </span>
              {Boolean(fechaDesde || fechaHasta) && (
                <button
                  type="button"
                  onClick={() => {
                    onDateRangeChange?.("", "");
                    setIsCustomDateOpen(false);
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Ver Todo
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <label htmlFor="dispensacion-popover-fecha-desde" className="text-[11px] font-semibold text-muted-foreground block">
                  Desde:
                </label>
                <DatePicker
                  id="dispensacion-popover-fecha-desde"
                  value={fechaDesde || ""}
                  onChange={(val) => onFechaDesdeChange?.(val)}
                  placeholder="DD/MM/AAAA"
                  allowClear
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="dispensacion-popover-fecha-hasta" className="text-[11px] font-semibold text-muted-foreground block">
                  Hasta:
                </label>
                <DatePicker
                  id="dispensacion-popover-fecha-hasta"
                  value={fechaHasta || ""}
                  onChange={(val) => onFechaHastaChange?.(val)}
                  placeholder="DD/MM/AAAA"
                  allowClear
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => {
                  onDateRangeChange?.(todayIso, todayIso);
                  setIsCustomDateOpen(false);
                }}
                className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
              >
                Restablecer a Hoy
              </button>
              <Button
                type="button"
                size="sm"
                className="h-7 text-xs px-3 cursor-pointer"
                onClick={() => setIsCustomDateOpen(false)}
              >
                Aplicar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

interface DispensacionListProps {
  readonly dispensaciones: DispensacionResponse[];
  readonly almacenes?: AlmacenResponse[];
  readonly isLoading?: boolean;
  readonly totalItems?: number;
  readonly currentPage?: number;
  readonly pageSize?: number;
  readonly searchTerm?: string;
  readonly selectedAlmacenId?: number | null;
  readonly selectedEstado?: EstadoDispensacion | null;
  readonly fechaDesde?: string;
  readonly fechaHasta?: string;
  readonly onSearchChange?: (val: string) => void;
  readonly onAlmacenChange?: (id: number | null) => void;
  readonly onEstadoChange?: (estado: EstadoDispensacion | null) => void;
  readonly onFechaDesdeChange?: (value: string) => void;
  readonly onFechaHastaChange?: (value: string) => void;
  readonly onDateRangeChange?: (desde: string, hasta: string) => void;
  readonly onResetFilters?: () => void;
  readonly onPageChange?: (page: number) => void;
  readonly onPageSizeChange?: (size: number) => void;
  readonly onViewDetail?: (item: DispensacionResponse) => void;
  readonly onEdit?: (item: DispensacionResponse) => void;
  readonly onCobrar?: (item: DispensacionResponse) => void;
  readonly onEntregar?: (item: DispensacionResponse) => void;
  readonly onAnular?: (item: DispensacionResponse) => void;
  readonly onViewAudit?: (item: DispensacionResponse) => void;
  readonly onRefresh?: () => void;
}

export function DispensacionList({
  dispensaciones,
  almacenes = [],
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  selectedAlmacenId = null,
  selectedEstado = null,
  fechaDesde,
  fechaHasta,
  onSearchChange,
  onAlmacenChange,
  onEstadoChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onDateRangeChange,
  onResetFilters,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onEdit,
  onCobrar,
  onEntregar,
  onAnular,
  onViewAudit,
  onRefresh,
}: Readonly<DispensacionListProps>) {
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
  const isCustomActive =
    !isTodayActive && !isYesterdayActive && !is7DaysActive && !isMonthActive && !isAllActive;

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedAlmacenId !== null ||
    selectedEstado !== null ||
    !isTodayActive;

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      onSearchChange?.("");
      onAlmacenChange?.(null);
      onEstadoChange?.(null);
      onDateRangeChange?.(todayIso, todayIso);
    }
  };
  const getEstadoBadge = (estado: string | number) => {
    if (isEstadoPendientePago(estado)) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-4.5 px-1.5 font-bold text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1"
        >
          <Clock className="size-2.5" /> Pendiente Pago (Editable)
        </Badge>
      );
    }
    if (isEstadoPagado(estado)) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-4.5 px-1.5 font-bold text-blue-700 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1"
        >
          <CheckCircle2 className="size-2.5" /> Pagado (Listo para Entrega)
        </Badge>
      );
    }
    if (isEstadoEntregado(estado)) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-4.5 px-1.5 font-bold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <PackageCheck className="size-2.5" /> Entregado (Despachado)
        </Badge>
      );
    }
    if (isEstadoAnulado(estado)) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-4.5 px-1.5 font-bold text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 gap-1"
        >
          <Ban className="size-2.5" /> Anulado
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 font-medium">
        {String(estado ?? "Desconocido")}
      </Badge>
    );
  };

  const getTipoBadge = (tipo?: string | number) => {
    const t = String(tipo ?? "").toLowerCase();
    if (t === "ventaambulatoria" || t === "1") {
      return (
        <Badge variant="secondary" className="text-[9px] h-4 px-1 text-muted-foreground font-medium">
          Venta Mostrador
        </Badge>
      );
    }
    if (t === "hospitalaria" || t === "2") {
      return (
        <Badge variant="secondary" className="text-[9px] h-4 px-1 text-blue-600 dark:text-blue-400 font-medium">
          Hospitalización
        </Badge>
      );
    }
    if (t === "urgencia" || t === "3") {
      return (
        <Badge variant="secondary" className="text-[9px] h-4 px-1 text-orange-600 dark:text-orange-400 font-medium">
          Urgencias
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controls & Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          {/* Warehouse Selector */}
          <select
            value={selectedAlmacenId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onAlmacenChange?.(val ? Number(val) : null);
            }}
            className="h-8 px-2.5 text-xs rounded-md border border-border/60 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-52 cursor-pointer"
          >
            <option value="">Todos los almacenes</option>
            {almacenes.map((alm) => (
              <option key={alm.id} value={alm.id}>
                {alm.nombre} ({alm.codigo})
              </option>
            ))}
          </select>

          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por N° ticket, paciente, C.I. o documento..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-8 text-xs h-8 bg-background border-border/60"
            />
          </div>
        </div>

        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="size-8 self-end sm:self-auto shrink-0 border-border/60"
            title="Recargar lista"
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
          </Button>
        )}
      </div>

      {/* Date Range Filter Bar */}
      <DispensacionDateFilterBar
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        todayIso={todayIso}
        yesterdayIso={yesterdayIso}
        last7DaysIso={last7DaysIso}
        monthStartIso={monthStartIso}
        isTodayActive={isTodayActive}
        isYesterdayActive={isYesterdayActive}
        is7DaysActive={is7DaysActive}
        isMonthActive={isMonthActive}
        isAllActive={isAllActive}
        isCustomActive={isCustomActive}
        onDateRangeChange={onDateRangeChange}
        onFechaDesdeChange={onFechaDesdeChange}
        onFechaHastaChange={onFechaHastaChange}
      />

      {/* Status Tabs */}
      <Tabs
        value={
          !selectedEstado
            ? "TODOS"
            : isEstadoPendientePago(selectedEstado)
              ? "PendientePago"
              : isEstadoPagado(selectedEstado)
                ? "Pagado"
                : isEstadoEntregado(selectedEstado)
                  ? "Entregado"
                  : isEstadoAnulado(selectedEstado)
                    ? "Anulado"
                    : String(selectedEstado)
        }
        onValueChange={(val) => {
          onEstadoChange?.(val === "TODOS" ? null : (val as EstadoDispensacion));
        }}
        className="w-full"
      >
        <TabsList className="h-7 p-0.5 bg-muted/60">
          <TabsTrigger value="TODOS" className="text-xs px-2.5 h-6">
            Todas
          </TabsTrigger>
          <TabsTrigger value="PendientePago" className="text-xs px-2.5 h-6">
            Pendientes en Caja
          </TabsTrigger>
          <TabsTrigger value="Pagado" className="text-xs px-2.5 h-6">
            Pagadas
          </TabsTrigger>
          <TabsTrigger value="Entregado" className="text-xs px-2.5 h-6">
            Entregadas
          </TabsTrigger>
          <TabsTrigger value="Anulado" className="text-xs px-2.5 h-6">
            Anuladas
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List Content */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 rounded-lg border border-border/50 bg-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
          ))
        ) : dispensaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-lg bg-card/40">
            <div className="size-10 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center mb-2">
              <Pill className="size-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              No se encontraron dispensaciones o ventas de farmacia
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {hasActiveFilters
                ? "No hay resultados para los filtros seleccionados o el rango de fechas. Intenta restablecer la búsqueda."
                : "Crea una nueva orden de farmacia para iniciar la preventa o dispensación."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs gap-1.5 cursor-pointer mt-2.5"
              >
                <X className="size-3.5" />
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          dispensaciones.map((item) => {
            const pacienteNombre =
              item.pacienteNombre || item.clienteNombre || "Cliente Particular";
            const documento =
              item.pacienteDocumento || item.clienteDocumento || "S/D";
            const isPendiente = isEstadoPendientePago(item.estado);
            const isPagado = isEstadoPagado(item.estado);
            const isEntregado = isEstadoEntregado(item.estado);
            const isAnulado = isEstadoAnulado(item.estado);

            return (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
              >
                {/* Left section: Ticket & Patient Info */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="size-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Pill className="size-4" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {item.numero}
                      </span>
                      {getTipoBadge(item.tipo)}
                      {getEstadoBadge(item.estado)}
                      {item.comprobanteCobro && (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 font-mono text-teal-700 dark:text-teal-400 border-teal-500/30 bg-teal-500/5"
                          title={`Método: ${item.metodoPago || "Caja"}`}
                        >
                          Recibo: {item.comprobanteCobro}
                        </Badge>
                      )}
                      {item.admisionNumero && (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 font-mono text-blue-700 dark:text-blue-400 border-blue-500/30 bg-blue-500/5"
                        >
                          Adm: {item.admisionNumero}
                        </Badge>
                      )}
                      {item.movimientoInventarioId ? (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 font-mono text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                          title="Movimiento de salida confirmado en Kárdex"
                        >
                          Mov: {item.movimientoInventarioNumero || `#${item.movimientoInventarioId}`}
                        </Badge>
                      ) : isPendiente || isPagado ? (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 font-medium text-amber-700 dark:text-amber-400 border-amber-500/25 bg-amber-500/5"
                          title="Stock reservado en almacén hasta su entrega"
                        >
                          Stock Reservado
                        </Badge>
                      ) : null}
                      <span className="text-[11px] text-muted-foreground">
                        • {formatDate(item.fecha)} • {item.almacenNombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <User className="size-3 text-muted-foreground" />
                      <span>{pacienteNombre}</span>
                      <span className="text-[10px] text-muted-foreground">
                        (Doc: {documento})
                      </span>
                      {item.medicoNombre && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 pl-2 border-l border-border/60">
                          <Stethoscope className="size-3 text-primary" />
                          {item.medicoNombre}
                        </span>
                      )}
                    </div>

                    {/* Medicines pills preview */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {item.detalles.slice(0, 3).map((d) => (
                        <span
                          key={d.id}
                          className="text-[10px] px-1.5 py-0.5 bg-muted/60 text-muted-foreground rounded border border-border/40 font-mono"
                        >
                          {d.cantidad}x {d.productoNombre}
                        </span>
                      ))}
                      {item.detalles.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{item.detalles.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right section: Total & Action Buttons */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Total a Pagar
                    </div>
                    <div className="font-mono text-sm font-bold text-foreground">
                      Bs. {item.total.toFixed(2)}
                    </div>
                  </div>

                  {/* Primary Context Actions */}
                  {isPendiente && onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                      className="h-7 text-xs px-2.5 gap-1.5 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10 cursor-pointer"
                      title="Editar orden y medicamentos"
                    >
                      <Pencil className="size-3" />
                      <span>Editar</span>
                    </Button>
                  )}

                  {isPendiente && onCobrar && (
                    <Button
                      size="sm"
                      onClick={() => onCobrar(item)}
                      className="h-7 text-xs px-2.5 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                      title="Registrar cobro en Caja"
                    >
                      <CreditCard className="size-3" />
                      <span>Cobrar</span>
                    </Button>
                  )}

                  {isPagado && onEntregar && (
                    <Button
                      size="sm"
                      onClick={() => onEntregar(item)}
                      className="h-7 text-xs px-2.5 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      title="Entregar fármacos y descontar stock"
                    >
                      <PackageCheck className="size-3" />
                      <span>Entregar</span>
                    </Button>
                  )}

                  {/* 3-dots Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent text-muted-foreground transition-colors cursor-pointer"
                      aria-label="Acciones de dispensación"
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {onViewDetail && (
                        <DropdownMenuItem
                          onClick={() => onViewDetail(item)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Eye className="size-3.5 text-primary" /> Ver Ticket / Detalle
                        </DropdownMenuItem>
                      )}
                      {onViewAudit && (
                        <DropdownMenuItem
                          onClick={() => onViewAudit(item)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Clock className="size-3.5" /> Ver Auditoría
                        </DropdownMenuItem>
                      )}
                      {!isAnulado && onAnular && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onAnular(item)}
                            className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Ban className="size-3.5" /> Anular Orden
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalItems > pageSize && (
        <DataTablePagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange ?? (() => {})}
          onPageSizeChange={onPageSizeChange ?? (() => {})}
        />
      )}
    </div>
  );
}
