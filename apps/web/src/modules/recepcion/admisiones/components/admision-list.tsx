"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  SearchInput,
  DataTablePagination,
} from "@/components/shared";
import {
  Eye,
  Trash2,
  FileText,
  Building2,
  Calendar,
  Stethoscope,
  User,
  CheckCircle2,
  Send,
  ShieldCheck,
  History,
  Pencil,
  LayoutGrid,
  FileEdit,
  Ban,
  X,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EstadoAdmision,
  formatConvenioNombre,
  formatPacienteDocumento,
  formatPacienteNombre,
  type AdmisionCounts,
  type AdmisionResponse,
  type EstadoAdmisionTab,
} from "../types/admision.types";
import { AdmisionStatusBadge } from "./admision-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AdmisionListProps {
  admisiones: AdmisionResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedEstadoTab?: EstadoAdmisionTab;
  counts?: AdmisionCounts;
  fechaDesde?: string;
  fechaHasta?: string;
  onFechaDesdeChange?: (value: string) => void;
  onFechaHastaChange?: (value: string) => void;
  onDateRangeChange?: (desde: string, hasta: string) => void;
  onEstadoTabChange?: (tab: EstadoAdmisionTab) => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (admision: AdmisionResponse) => void;
  onEdit?: (admision: AdmisionResponse) => void;
  onDirectChangeStatus?: (admision: AdmisionResponse, nuevoEstado: EstadoAdmision) => void;
  onDelete: (id: number) => void;
  onResetFilters?: () => void;
}

function getInitials(name: string): string {
  if (!name) return "PA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.substring(0, 2) || "PA").toUpperCase();
}

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

function AdmisionSkeletonList() {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-2.5 sm:px-3 sm:py-2.5 rounded-xl border border-border/60 bg-card space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface AdmisionEmptyStateProps {
  hasActiveFilters: boolean;
  onReset: () => void;
}

function AdmisionEmptyState({
  hasActiveFilters,
  onReset,
}: Readonly<AdmisionEmptyStateProps>) {
  return (
    <div className="py-14 text-center border border-dashed border-border/70 rounded-2xl bg-muted/10 space-y-3 px-4">
      <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground/60 border border-border/50">
        <FileText className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-bold text-sm text-foreground">No se encontraron admisiones</p>
        <p className="text-xs max-w-sm mx-auto text-muted-foreground">
          {hasActiveFilters
            ? "No hay resultados para los filtros seleccionados. Intenta restablecer la búsqueda."
            : "Aún no se han registrado admisiones para esta vista."}
        </p>
      </div>
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="text-xs gap-1.5 cursor-pointer mt-1"
        >
          <X className="size-3.5" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}

interface AdmisionAuditMetaProps {
  creadoPor?: string | null;
  fechaCreacion?: string | null;
  modificadoPor?: string | null;
  fechaModificacion?: string | null;
}

function AdmisionAuditMeta({
  creadoPor,
  fechaCreacion,
  modificadoPor,
  fechaModificacion,
}: Readonly<AdmisionAuditMetaProps>) {
  if (!creadoPor && !fechaCreacion && !modificadoPor) return null;

  return (
    <div className="flex items-center gap-1.5 text-[9.5px] text-muted-foreground/60 flex-wrap">
      {creadoPor && (
        <span
          className="flex items-center gap-1 hover:text-foreground/80 transition-colors"
          title={
            fechaCreacion
              ? `Creado el ${new Date(fechaCreacion).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}`
              : undefined
          }
        >
          <ShieldCheck className="size-2.5 text-primary/60 shrink-0" />
          <span>
            Por: <strong className="text-foreground/70 font-medium">{creadoPor}</strong>
          </span>
        </span>
      )}

      {modificadoPor && (
        <>
          <span className="text-muted-foreground/30">•</span>
          <span
            className="flex items-center gap-1 hover:text-foreground/80 transition-colors"
            title={
              fechaModificacion
                ? `Modificado el ${new Date(fechaModificacion).toLocaleString("es-ES", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}`
                : undefined
            }
          >
            <History className="size-2.5 text-amber-600/60 shrink-0" />
            <span>
              Modif: <strong className="text-foreground/70 font-medium">{modificadoPor}</strong>
            </span>
          </span>
        </>
      )}
    </div>
  );
}

interface AdmisionItemActionsProps {
  adm: AdmisionResponse;
  onViewDetail: (admision: AdmisionResponse) => void;
  onEdit?: (admision: AdmisionResponse) => void;
  onDirectChangeStatus?: (admision: AdmisionResponse, nuevoEstado: EstadoAdmision) => void;
  onDelete: (id: number) => void;
}

function AdmisionItemActions({
  adm,
  onViewDetail,
  onEdit,
  onDirectChangeStatus,
  onDelete,
}: Readonly<AdmisionItemActionsProps>) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      <AdmisionStatusBadge estado={adm.estado} />

      {/* Botón directo de flujo según estado (Sin Modal) */}
      {adm.estado === EstadoAdmision.Registrada && (
        <Button
          type="button"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDirectChangeStatus?.(adm, EstadoAdmision.Confirmada);
          }}
          className="h-7 px-2 sm:px-2.5 text-[11px] font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
          title="Confirmar admisión directamente"
        >
          <CheckCircle2 className="size-3 shrink-0" />
          <span>Confirmar</span>
        </Button>
      )}

      {adm.estado === EstadoAdmision.Confirmada && (
        <Button
          type="button"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDirectChangeStatus?.(adm, EstadoAdmision.EnviadaVenta);
          }}
          className="h-7 px-2 sm:px-2.5 text-[11px] font-semibold gap-1 bg-purple-600 hover:bg-purple-700 text-white shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
          title="Enviar admisión a Venta/Facturación"
        >
          <Send className="size-3 shrink-0" />
          <span>A Venta</span>
        </Button>
      )}

      {/* Botón Ver Ficha */}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetail(adm);
        }}
        className="h-7 px-2 text-[11px] font-medium gap-1 border-border/70 text-foreground hover:bg-accent hover:text-primary shadow-2xs cursor-pointer transition-all"
        title="Ver Ficha y Detalle de Admisión"
      >
        <Eye className="size-3 text-primary shrink-0" />
        <span className="hidden md:inline">Ver Ficha</span>
      </Button>

      {/* Menú de Acciones Adicionales (Editar, Cancelar) */}
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="size-7 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-border/60 cursor-pointer"
          title="Más opciones"
        >
          <MoreVertical className="size-3.5" />
          <span className="sr-only">Más opciones</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 text-xs">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(adm);
            }}
            className="gap-2 cursor-pointer font-medium"
          >
            <Eye className="size-3.5 text-primary shrink-0" />
            <span>Ver Ficha Detalle</span>
          </DropdownMenuItem>

          {adm.estado === EstadoAdmision.Registrada && onEdit && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(adm);
              }}
              className="gap-2 text-amber-700 dark:text-amber-400 cursor-pointer"
            >
              <Pencil className="size-3.5 shrink-0" />
              <span>Editar Admisión</span>
            </DropdownMenuItem>
          )}

          {adm.estado !== EstadoAdmision.Cancelada && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(adm.id);
                }}
                className="gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer"
              >
                <Trash2 className="size-3.5 shrink-0" />
                <span>Cancelar Admisión</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface AdmisionListItemProps {
  adm: AdmisionResponse;
  onViewDetail: (admision: AdmisionResponse) => void;
  onEdit?: (admision: AdmisionResponse) => void;
  onDirectChangeStatus?: (admision: AdmisionResponse, nuevoEstado: EstadoAdmision) => void;
  onDelete: (id: number) => void;
}

function AdmisionListItem({
  adm,
  onViewDetail,
  onEdit,
  onDirectChangeStatus,
  onDelete,
}: Readonly<AdmisionListItemProps>) {
  const total =
    adm.totalAdmision ??
    adm.detalles.reduce((acc, d) => acc + (d.total || 0), 0);

  const nombreCompleto = formatPacienteNombre(adm.paciente, adm.pacienteNombre);
  const documento = formatPacienteDocumento(adm.paciente, adm.pacienteDocumento);
  const convenio =
    adm.convenio?.nombre || formatConvenioNombre(adm.convenio, adm.convenioNombre);

  const numPrestaciones = adm.detalles.length;
  const primeraPrestacion = adm.detalles[0]?.servicioNombre || "Consulta Médica";
  const initials = getInitials(nombreCompleto);

  const prestacionesLabel =
    numPrestaciones > 1
      ? `${primeraPrestacion} (+${numPrestaciones - 1})`
      : primeraPrestacion;

  return (
    <div
      onClick={() => onViewDetail(adm)}
      className="group cursor-pointer p-2.5 sm:px-3 sm:py-2.5 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:bg-muted/15 hover:shadow-xs transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative"
    >
      {/* Bloque Izquierdo: Avatar con Iniciales + Paciente + Documento + Convenio + Fecha + Prestaciones */}
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        {/* Badge / Avatar con Iniciales */}
        <div className="size-8.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors shadow-2xs">
          {initials}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          {/* Fila Principal: Número, Paciente, Doc, Convenio */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-mono font-bold text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
              #{adm.numero}
            </span>

            <span
              className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate text-left"
              title={`Admisión #${adm.numero} - ${nombreCompleto}`}
            >
              {nombreCompleto}
            </span>

            {documento && (
              <span className="text-[10.5px] text-muted-foreground font-mono bg-muted/70 px-1.5 py-0.2 rounded border border-border/40 shrink-0">
                CI: {documento}
              </span>
            )}

            {convenio && (
              <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded inline-flex items-center gap-1 shrink-0">
                <Building2 className="size-2.5 shrink-0" />
                <span className="truncate max-w-[130px]">{convenio}</span>
              </span>
            )}
          </div>

          {/* Fila Secundaria: Fecha, Prestación, Recepcionista, Auditoría */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
              <span>
                {new Date(adm.fechaHora).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </span>

            <span className="text-muted-foreground/30">•</span>

            <span className="flex items-center gap-1">
              <Stethoscope className="size-3 text-blue-600/80 shrink-0" />
              <span
                className="truncate max-w-[200px]"
                title={adm.detalles.map((d) => d.servicioNombre).join(", ")}
              >
                {prestacionesLabel}
              </span>
            </span>

            {adm.recepcionista && (
              <>
                <span className="text-muted-foreground/30">•</span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10.5px] text-foreground/80">
                  <User className="size-3 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[120px]" title={adm.recepcionista.nombreCompleto}>
                    {adm.recepcionista.nombreCompleto}
                  </span>
                </span>
              </>
            )}

            {(adm.creadoPor || adm.modificadoPor) && (
              <>
                <span className="text-muted-foreground/30 hidden lg:inline">•</span>
                <span className="hidden lg:inline-flex">
                  <AdmisionAuditMeta
                    creadoPor={adm.creadoPor}
                    fechaCreacion={adm.fechaCreacion}
                    modificadoPor={adm.modificadoPor}
                    fechaModificacion={adm.fechaModificacion}
                  />
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bloque Derecho: Precio, Estado & Acciones */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
        <div className="flex flex-col items-start sm:items-end pr-0.5">
          <span className="text-xs sm:text-sm font-black text-foreground font-mono tracking-tight">
            Bs. {total.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            {numPrestaciones} prestación{numPrestaciones !== 1 ? "es" : ""}
          </span>
        </div>

        <AdmisionItemActions
          adm={adm}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDirectChangeStatus={onDirectChangeStatus}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

interface AdmisionDateFilterBarProps {
  fechaDesde?: string;
  fechaHasta?: string;
  todayIso: string;
  yesterdayIso: string;
  last7DaysIso: string;
  monthStartIso: string;
  isTodayActive: boolean;
  isYesterdayActive: boolean;
  is7DaysActive: boolean;
  isMonthActive: boolean;
  isAllActive: boolean;
  isCustomActive: boolean;
  onDateRangeChange?: (desde: string, hasta: string) => void;
  onFechaDesdeChange?: (value: string) => void;
  onFechaHastaChange?: (value: string) => void;
}

function AdmisionDateFilterBar({
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
}: Readonly<AdmisionDateFilterBarProps>) {
  const [isCustomDateOpen, setIsCustomDateOpen] = React.useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-card border border-border/60 shadow-2xs">
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
                <label htmlFor="admision-popover-fecha-desde" className="text-[11px] font-semibold text-muted-foreground block">
                  Desde:
                </label>
                <DatePicker
                  id="admision-popover-fecha-desde"
                  value={fechaDesde || ""}
                  onChange={(val) => onFechaDesdeChange?.(val)}
                  placeholder="DD/MM/AAAA"
                  allowClear
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="admision-popover-fecha-hasta" className="text-[11px] font-semibold text-muted-foreground block">
                  Hasta:
                </label>
                <DatePicker
                  id="admision-popover-fecha-hasta"
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

export function AdmisionList({
  admisiones,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedEstadoTab = "TODOS",
  counts,
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  onDateRangeChange,
  onEstadoTabChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onEdit,
  onDirectChangeStatus,
  onDelete,
  onResetFilters,
}: Readonly<AdmisionListProps>) {
  const tabs: Array<{
    key: EstadoAdmisionTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    activeClasses: string;
  }> = [
      {
        key: "TODOS",
        label: "Todos",
        icon: LayoutGrid,
        count: counts?.todos,
        activeClasses: "bg-primary text-primary-foreground shadow-xs shadow-primary/20",
      },
      {
        key: EstadoAdmision.Registrada,
        label: "Registradas",
        icon: FileEdit,
        count: counts?.registradas,
        activeClasses: "bg-blue-600 text-white shadow-xs shadow-blue-600/20",
      },
      {
        key: EstadoAdmision.Confirmada,
        label: "Confirmadas",
        icon: CheckCircle2,
        count: counts?.confirmadas,
        activeClasses: "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20",
      },
      {
        key: EstadoAdmision.EnviadaVenta,
        label: "Enviadas a Venta",
        icon: Send,
        count: counts?.enviadasVenta,
        activeClasses: "bg-purple-600 text-white shadow-xs shadow-purple-600/20",
      },
      {
        key: EstadoAdmision.Cancelada,
        label: "Canceladas",
        icon: Ban,
        count: counts?.canceladas,
        activeClasses: "bg-rose-600 text-white shadow-xs shadow-rose-600/20",
      },
    ];

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

  const isDefaultDate = isTodayActive;
  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedEstadoTab !== "TODOS" ||
    !isDefaultDate;

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      onSearchChange("");
      onEstadoTabChange?.("TODOS");
    }
  };

  return (
    <div className="space-y-2.5 w-full">
      {/* FILTROS EN FORMATO BADGE Y BUSCADOR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 px-0.5">
        {/* Badges interactivos de estado */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedEstadoTab === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key.toString()}
                type="button"
                onClick={() => onEstadoTabChange?.(t.key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${isActive
                    ? t.activeClasses
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                  }`}
              >
                <Icon className="size-3.5 shrink-0 opacity-80" />
                <span>{t.label}</span>
                {typeof t.count === "number" && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono transition-colors ${isActive
                        ? "bg-white/20 text-white"
                        : "bg-background text-muted-foreground border border-border/50"
                      }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Buscador y Limpiar */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <div className="w-full md:w-64">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Buscar admisión, DNI, paciente..."
              className="h-8 text-xs bg-background shadow-2xs"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0 cursor-pointer gap-1"
              title="Restablecer filtros"
            >
              <X className="size-3.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </Button>
          )}
        </div>
      </div>

      {/* BARRA DE PERÍODO Y FILTRO POR FECHA */}
      <AdmisionDateFilterBar
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

      {/* CONTENIDO DEL LISTADO */}
      <div className="space-y-1.5">
        {isLoading && <AdmisionSkeletonList />}

        {!isLoading && admisiones.length === 0 && (
          <AdmisionEmptyState
            hasActiveFilters={hasActiveFilters}
            onReset={handleReset}
          />
        )}

        {!isLoading && admisiones.length > 0 && (
          <div className="space-y-1.5">
            {admisiones.map((adm) => (
              <AdmisionListItem
                key={adm.id}
                adm={adm}
                onViewDetail={onViewDetail}
                onEdit={onEdit}
                onDirectChangeStatus={onDirectChangeStatus}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}

        {/* PAGINACIÓN: Solo se muestra si hay más de 10 registros */}
        {totalItems > 10 && (
          <div className="pt-2 px-1">
            <DataTablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
