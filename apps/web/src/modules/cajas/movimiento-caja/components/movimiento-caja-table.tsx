"use client";

import * as React from "react";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Store,
  Calendar,
  ChevronDown,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MovimientoCajaResponse } from "../types/movimiento-caja.types";
import type { TurnoCajaInfo } from "../../turno-caja/types/turno-caja.types";

interface MovimientoCajaTableProps {
  movimientos: MovimientoCajaResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  filtroNaturaleza: "TODOS" | "ENTRADA" | "SALIDA";
  turnos?: TurnoCajaInfo[];
  selectedTurnoId?: number | null;
  fechaDesde?: string;
  fechaHasta?: string;
  onFechaDesdeChange?: (val: string) => void;
  onFechaHastaChange?: (val: string) => void;
  onDateRangeChange?: (desde: string, hasta: string) => void;
  onTurnoChange?: (turnoId: number | null) => void;
  onFiltroNaturalezaChange: (filtro: "TODOS" | "ENTRADA" | "SALIDA") => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (movimiento: MovimientoCajaResponse) => void;
  onEdit: (movimiento: MovimientoCajaResponse) => void;
  onDelete: (movimiento: MovimientoCajaResponse) => void;
  onRefresh: () => void;
}

function getTodayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLast7DaysIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfMonthIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
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
  if (isAll || (!desde && !hasta)) return "Todas las fechas";
  if (isToday) return "Hoy";
  if (isYesterday) return "Ayer";
  if (is7Days) return "Últimos 7 días";
  if (isMonth) return "Este mes";
  if (desde && hasta && desde === hasta) {
    const [, m, d] = desde.split("-");
    return `${d}/${m}`;
  }
  if (desde && hasta) {
    const [, m1, d1] = desde.split("-");
    const [, m2, d2] = hasta.split("-");
    return `${d1}/${m1} - ${d2}/${m2}`;
  }
  if (desde) {
    const [, m, d] = desde.split("-");
    return `Desde ${d}/${m}`;
  }
  if (hasta) {
    const [, m, d] = hasta.split("-");
    return `Hasta ${d}/${m}`;
  }
  return "Período";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-BO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function renderTipoBadge(mov: MovimientoCajaResponse) {
  const isEntrada =
    mov.naturalezaAplicada?.toUpperCase() === "ENTRADA" ||
    mov.tipoMovimientoCaja?.naturaleza?.toUpperCase() === "ENTRADA";

  if (isEntrada) {
    return (
      <Badge
        variant="default"
        className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium"
      >
        <ArrowDownLeft className="size-3 mr-1" />
        <span>{mov.tipoMovimientoCaja?.nombre || "Entrada (+)"}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="text-[10px] px-2 py-0.5 bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-medium"
    >
      <ArrowUpRight className="size-3 mr-1" />
      <span>{mov.tipoMovimientoCaja?.nombre || "Salida (-)"}</span>
    </Badge>
  );
}

export function MovimientoCajaTable({
  movimientos,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  filtroNaturaleza,
  turnos = [],
  selectedTurnoId,
  fechaDesde = "",
  fechaHasta = "",
  onFechaDesdeChange,
  onFechaHastaChange,
  onDateRangeChange,
  onTurnoChange,
  onFiltroNaturalezaChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onEdit,
  onDelete,
}: Readonly<MovimientoCajaTableProps>) {
  const [isDateOpen, setIsDateOpen] = React.useState(false);
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const todayIso = React.useMemo(() => getTodayIso(), []);
  const yesterdayIso = React.useMemo(() => getYesterdayIso(), []);
  const last7DaysIso = React.useMemo(() => getLast7DaysIso(), []);
  const monthStartIso = React.useMemo(() => getStartOfMonthIso(), []);

  const isTodayActive = fechaDesde === todayIso && fechaHasta === todayIso;
  const isYesterdayActive =
    fechaDesde === yesterdayIso && fechaHasta === yesterdayIso;
  const is7DaysActive =
    fechaDesde === last7DaysIso && fechaHasta === todayIso;
  const isMonthActive =
    fechaDesde === monthStartIso && fechaHasta === todayIso;
  const isAllActive = !fechaDesde && !fechaHasta;
  const hasActiveDateFilter = !isAllActive;
  const isDateInverted = Boolean(
    fechaDesde && fechaHasta && fechaDesde > fechaHasta
  );

  const rangeLabel = getRangeLabel(
    fechaDesde,
    fechaHasta,
    isTodayActive,
    isYesterdayActive,
    is7DaysActive,
    isMonthActive,
    isAllActive
  );

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, idx) => (
        <TableRow key={idx} className="h-11">
          <TableCell className="py-2">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="py-2">
            <Skeleton className="h-5 w-28 rounded-full" />
          </TableCell>
          <TableCell className="py-2">
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell className="py-2">
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="py-2">
            <Skeleton className="h-4 w-20 ml-auto" />
          </TableCell>
          <TableCell className="py-2">
            <Skeleton className="h-7 w-14 ml-auto" />
          </TableCell>
        </TableRow>
      ));
    }

    if (movimientos.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-32 text-center">
            <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground py-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground/50">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                No se encontraron movimientos registrados
              </p>
              <p className="text-[11px] text-muted-foreground/70 max-w-sm">
                {searchTerm ||
                filtroNaturaleza !== "TODOS" ||
                selectedTurnoId ||
                hasActiveDateFilter
                  ? "Intente ajustar o limpiar los filtros de búsqueda o fechas aplicados."
                  : "Comience registrando un nuevo movimiento de caja."}
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return movimientos.map((mov) => {
      const isEntrada =
        mov.naturalezaAplicada?.toUpperCase() === "ENTRADA" ||
        mov.tipoMovimientoCaja?.naturaleza?.toUpperCase() === "ENTRADA";
      const simbolo = mov.moneda?.simbolo || "Bs.";
      const montoFormateado = Number(mov.monto).toLocaleString("es-BO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const baseFormateado = Number(mov.montoMonedaBase ?? mov.monto).toLocaleString(
        "es-BO",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

      return (
        <TableRow
          key={mov.id}
          onClick={() => onViewDetail(mov)}
          className="hover:bg-muted/50 transition-colors h-11 cursor-pointer group"
        >
          {/* Fecha y Hora */}
          <TableCell className="text-muted-foreground text-[11px] font-mono py-2">
            {formatDate(mov.fechaHora)}
          </TableCell>

          {/* Tipo / Naturaleza */}
          <TableCell className="py-2">{renderTipoBadge(mov)}</TableCell>

          {/* Concepto / Motivo */}
          <TableCell className="py-2 max-w-xs">
            <div className="flex flex-col">
              <span className="font-medium text-xs text-foreground group-hover:text-primary transition-colors truncate">
                {mov.conceptoMovimientoCaja?.nombre || "-"}
              </span>
              {mov.referencia && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  Ref: {mov.referencia}
                </span>
              )}
            </div>
          </TableCell>

          {/* Caja / Turno */}
          <TableCell className="text-xs py-2">
            <div className="flex flex-col">
              <span className="font-medium text-foreground text-xs">
                {mov.turnoCaja?.caja?.nombre || "Caja General"}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {mov.turnoCaja?.caja?.codigo || mov.turnoCaja?.empleado?.nombreCompleto || "Caja"}
              </span>
            </div>
          </TableCell>

          {/* Monto */}
          <TableCell
            className={`text-right font-mono text-xs font-bold py-2 ${
              isEntrada
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            <div className="flex flex-col items-end">
              <span>
                {isEntrada ? "+" : "-"}
                {simbolo} {montoFormateado}
              </span>
              {mov.tipoCambio && mov.tipoCambio !== 1 && (
                <span className="text-[10px] text-muted-foreground font-normal font-sans">
                  Base: Bs. {baseFormateado}
                </span>
              )}
            </div>
          </TableCell>

          {/* Acciones */}
          <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={() => onViewDetail(mov)}
                title="Ver detalle"
              >
                <Eye className="size-3.5" />
                <span className="sr-only">Ver detalle</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">Más opciones</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 text-xs">
                  <DropdownMenuLabel className="text-[11px]">Acciones</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onViewDetail(mov)} className="gap-2 text-xs">
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span>Ver Detalle</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(mov)} className="gap-2 text-xs">
                    <Pencil className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(mov)}
                    className="gap-2 text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="space-y-3">
      {/* Barra de Filtros Unificada y Espaciosa */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 p-2.5 rounded-lg border border-border/70 bg-card shadow-2xs">
        {/* Lado Izquierdo: Pestañas de Naturaleza */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/50 text-xs self-start">
          <button
            type="button"
            onClick={() => onFiltroNaturalezaChange("TODOS")}
            className={`px-3 py-1.5 font-medium rounded-md transition-all cursor-pointer ${
              filtroNaturaleza === "TODOS"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({totalItems})
          </button>
          <button
            type="button"
            onClick={() => onFiltroNaturalezaChange("ENTRADA")}
            className={`px-3 py-1.5 font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              filtroNaturaleza === "ENTRADA"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-emerald-600"
            }`}
          >
            <ArrowDownLeft className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span>Ingresos (+)</span>
          </button>
          <button
            type="button"
            onClick={() => onFiltroNaturalezaChange("SALIDA")}
            className={`px-3 py-1.5 font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              filtroNaturaleza === "SALIDA"
                ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-rose-600"
            }`}
          >
            <ArrowUpRight className="size-3 text-rose-600 dark:text-rose-400" />
            <span>Egresos (-)</span>
          </button>
        </div>

        {/* Lado Derecho: Filtro de Caja / Turno + Búsqueda */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Turno / Caja */}
          {turnos.length > 0 && onTurnoChange && (
            <Select
              value={selectedTurnoId ? String(selectedTurnoId) : "ALL"}
              onValueChange={(val) =>
                onTurnoChange(val === "ALL" ? null : Number(val))
              }
            >
              <SelectTrigger className="h-8.5 w-full sm:w-[230px] text-xs bg-background">
                <Store className="size-3 text-muted-foreground mr-1.5 shrink-0" />
                <SelectValue placeholder="Todas las Cajas..." />
              </SelectTrigger>
              <SelectContent className="min-w-[260px] max-h-60" align="end">
                <SelectItem value="ALL">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs">Todas las Cajas / Turnos</span>
                  </div>
                </SelectItem>
                {turnos.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    <div className="flex flex-col text-left py-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-xs">
                        <span>{t.caja?.nombre || "Caja"}</span>
                        {t.caja?.codigo && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                            {t.caja.codigo}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Cajero: {t.empleado?.nombreCompleto || "Asignado"}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Selector de Rango de Fecha */}
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <PopoverTrigger
              type="button"
              className={cn(
                "inline-flex items-center justify-between rounded-md border h-8.5 px-2.5 text-xs font-medium gap-1.5 transition-all cursor-pointer shadow-2xs select-none shrink-0 w-full sm:w-auto",
                hasActiveDateFilter
                  ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15 font-semibold"
                  : "bg-background border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              title="Filtrar por rango de fechas (FechaHora)"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="size-3.5 text-primary shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[160px]">
                  {rangeLabel}
                </span>
              </div>
              <ChevronDown className="size-3 opacity-60 ml-1 shrink-0" />
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
                  Filtro por Fecha
                </span>
                {hasActiveDateFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      onDateRangeChange?.("", "");
                      setIsDateOpen(false);
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="size-3" />
                    <span>Restablecer</span>
                  </button>
                )}
              </div>

              {/* Accesos rápidos */}
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
                  🌐 Todo el Historial
                </button>
              </div>

              {/* Separador */}
              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-border/50 w-full" />
                <span className="bg-popover px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold absolute">
                  Rango Personalizado
                </span>
              </div>

              {/* Inputs Desde / Hasta */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <label
                    htmlFor="mc-popover-fecha-desde"
                    className="text-[11px] font-semibold text-muted-foreground block"
                  >
                    Desde:
                  </label>
                  <DatePicker
                    id="mc-popover-fecha-desde"
                    value={fechaDesde || ""}
                    onChange={(val) => onFechaDesdeChange?.(val)}
                    placeholder="DD/MM/AAAA"
                    allowClear
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="mc-popover-fecha-hasta"
                    className="text-[11px] font-semibold text-muted-foreground block"
                  >
                    Hasta:
                  </label>
                  <DatePicker
                    id="mc-popover-fecha-hasta"
                    value={fechaHasta || ""}
                    onChange={(val) => onFechaHastaChange?.(val)}
                    placeholder="DD/MM/AAAA"
                    allowClear
                  />
                </div>
              </div>

              {/* Alerta si fechaDesde > fechaHasta */}
              {isDateInverted && (
                <div className="flex items-center gap-1.5 p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px]">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>La fecha &apos;Desde&apos; no puede ser posterior a &apos;Hasta&apos;.</span>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Búsqueda con Limpiador */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar concepto, ref..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-7 h-8.5 text-xs bg-background"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
                <span className="sr-only">Limpiar búsqueda</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="h-9 hover:bg-transparent">
              <TableHead className="w-[130px] text-xs font-semibold py-2">Fecha y Hora</TableHead>
              <TableHead className="w-[150px] text-xs font-semibold py-2">Tipo / Impacto</TableHead>
              <TableHead className="text-xs font-semibold py-2">Concepto / Motivo</TableHead>
              <TableHead className="w-[130px] text-xs font-semibold py-2">Caja / Turno</TableHead>
              <TableHead className="w-[140px] text-right text-xs font-semibold py-2">Monto (Bs.)</TableHead>
              <TableHead className="w-[90px] text-right text-xs font-semibold py-2">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>

        {/* Paginación Compacta */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-2 border-t border-border bg-muted/15 text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>Mostrar</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-[60px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>
              por pág. Total: <strong>{totalItems}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Siguiente</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
