"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchInput,
  DataTablePagination,
} from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pencil,
  Trash2,
  Clock,
  LogOut,
  RefreshCw,
  CheckCircle2,
  PlayCircle,
  Vault,
  User,
  Calendar,
  Hourglass,
  Plus,
  FilterX,
} from "lucide-react";
import {
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../types/turno-caja.types";
import type { CajaResponse } from "@/modules/cajas/caja/types/caja.types";

interface TurnoCajaListProps {
  turnos: TurnoCajaResponse[];
  cajas: CajaResponse[];
  counts?: {
    total: number;
    abiertos: number;
    cerrados: number;
  };
  isLoading?: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedStatusTab?: "TODOS" | "ABIERTOS" | "CERRADOS";
  selectedCajaFilter?: string;
  onStatusTabChange?: (tab: "TODOS" | "ABIERTOS" | "CERRADOS") => void;
  onCajaFilterChange?: (cajaId: string) => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (turno: TurnoCajaResponse) => void;
  onCloseTurno: (turno: TurnoCajaResponse) => void;
  onDelete: (turno: TurnoCajaResponse) => void;
  onNewTurnoClick?: () => void;
  onRefresh?: () => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateDuration(startStr?: string, endStr?: string | null): string {
  if (!startStr) return "";
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours === 0) {
    return `${diffMinutes}m`;
  }
  return `${diffHours}h ${diffMinutes}m`;
}

function getInitials(name?: string | null): string {
  if (!name) return "E";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0][0] || "E").toUpperCase();
}

export function TurnoCajaList({
  turnos,
  cajas,
  counts,
  isLoading = false,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedStatusTab = "TODOS",
  selectedCajaFilter = "ALL",
  onStatusTabChange,
  onCajaFilterChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onCloseTurno,
  onDelete,
  onNewTurnoClick,
  onRefresh,
}: TurnoCajaListProps) {
  const tabs: Array<{
    key: "TODOS" | "ABIERTOS" | "CERRADOS";
    label: string;
    count?: number;
    icon: React.ReactNode;
    activeClasses: string;
  }> = [
    {
      key: "TODOS",
      label: "Todos",
      count: counts?.total,
      icon: <Clock className="size-3.5" />,
      activeClasses: "bg-primary text-primary-foreground shadow-xs",
    },
    {
      key: "ABIERTOS",
      label: "Abiertos",
      count: counts?.abiertos,
      icon: <PlayCircle className="size-3.5" />,
      activeClasses: "bg-emerald-600 text-white shadow-xs",
    },
    {
      key: "CERRADOS",
      label: "Cerrados",
      count: counts?.cerrados,
      icon: <CheckCircle2 className="size-3.5" />,
      activeClasses: "bg-slate-700 dark:bg-slate-600 text-white shadow-xs",
    },
  ];

  const hasActiveFilters =
    searchTerm !== "" || selectedStatusTab !== "TODOS" || selectedCajaFilter !== "ALL";

  return (
    <div className="space-y-3 w-full">
      {/* Toolbar: Filtros de Estado, Selector de Caja, Buscador */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 p-1 rounded-xl bg-card border border-border/60 shadow-2xs">
        {/* Pills de Estado con contador */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedStatusTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onStatusTabChange?.(t.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? t.activeClasses
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-background/80 text-muted-foreground"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filtro Caja + Search + Refresh */}
        <div className="flex flex-col sm:flex-row items-center gap-2 p-1">
          {/* Selector de Caja */}
          <div className="w-full sm:w-52">
            <Select
              value={selectedCajaFilter}
              onValueChange={(val) => onCajaFilterChange?.(val ?? "ALL")}
            >
              <SelectTrigger className="h-8.5 text-xs bg-background border-border/80 shadow-2xs w-full">
                <div className="flex items-center gap-1.5 truncate">
                  <Vault className="size-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Todas las cajas" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las cajas registradoras</SelectItem>
                {cajas.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.codigo} - {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buscador */}
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Buscar cajero o caja..."
              className="h-8.5 text-xs bg-background border-border/80 shadow-2xs"
            />
          </div>

          {/* Botón Refrescar */}
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="size-8.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0 border-border/80 bg-background"
              title="Actualizar datos"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Listado de Turnos en Tarjetas UI/UX Premium */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-border/60 bg-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="flex gap-4 pt-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : turnos.length === 0 ? (
          <div className="py-14 text-center border-2 border-dashed border-border/60 rounded-2xl bg-card/50 backdrop-blur-xs space-y-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60 mx-auto">
              {hasActiveFilters ? (
                <FilterX className="size-6" />
              ) : (
                <Clock className="size-6" />
              )}
            </div>
            <div className="space-y-1 max-w-sm mx-auto px-4">
              <h3 className="font-bold text-sm text-foreground">
                {hasActiveFilters
                  ? "No hay resultados para los filtros aplicados"
                  : "No hay turnos registrados actualmente"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters
                  ? "Intente restablecer los filtros de búsqueda o seleccionar otra caja."
                  : "Inicie la jornada registrando una nueva apertura de turno para un cajero."}
              </p>
            </div>

            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSearchChange("");
                  onStatusTabChange?.("TODOS");
                  onCajaFilterChange?.("ALL");
                }}
                className="h-8 text-xs cursor-pointer"
              >
                Limpiar filtros
              </Button>
            ) : onNewTurnoClick ? (
              <Button
                onClick={onNewTurnoClick}
                size="sm"
                className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Abrir primer turno</span>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            {turnos.map((turno) => {
              const isAbierto = turno.estado === EstadoTurnoCaja.Abierto;
              const cajaCodigo = turno.caja?.codigo || `CAJA-${turno.id}`;
              const cajaNombre = turno.caja?.nombre || `Caja #${turno.id}`;
              const empleadoNombre = turno.empleado?.nombreCompleto || "Sin asignar";
              const empleadoCodigo = turno.empleado?.codigoEmpleado;
              const durationText = calculateDuration(
                turno.fechaHoraApertura,
                turno.fechaHoraCierre
              );

              return (
                <div
                  key={turno.id}
                  className={`group relative overflow-hidden p-4 rounded-xl border transition-all shadow-2xs hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isAbierto
                      ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/[0.04] via-card to-card hover:border-emerald-500/60"
                      : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/15"
                  }`}
                >
                  {/* Indicador de barra lateral de estado activo */}
                  {isAbierto && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                  )}

                  {/* Bloque Izquierdo: Icono/Avatar + Detalles */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1 pl-1">
                    {/* Avatar de Cajero o Icono de Estado */}
                    <div className="relative shrink-0">
                      <div
                        className={`size-11 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs border ${
                          isAbierto
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : "bg-muted text-muted-foreground border-border/80"
                        }`}
                      >
                        {isAbierto ? (
                          <Clock className="size-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                        ) : (
                          <span className="font-mono text-xs">
                            {getInitials(empleadoNombre)}
                          </span>
                        )}
                      </div>

                      {/* Badge flotante en el icono */}
                      <span
                        className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-card flex items-center justify-center ${
                          isAbierto ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      >
                        {isAbierto && (
                          <span className="size-1 rounded-full bg-white" />
                        )}
                      </span>
                    </div>

                    {/* Información Principal */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {/* Fila 1: Caja + ID + Estado Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 flex items-center gap-1.5">
                          <Vault className="size-3" />
                          {cajaCodigo}
                        </span>

                        <h3 className="font-bold text-sm text-foreground truncate">
                          {cajaNombre}
                        </h3>

                        <span className="text-[11px] text-muted-foreground font-mono">
                          #Turno-{turno.id}
                        </span>

                        <div className="ml-auto sm:ml-0 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                              isAbierto
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 gap-1.5"
                                : "bg-muted text-muted-foreground border-border/80 gap-1.5"
                            }`}
                          >
                            {isAbierto ? (
                              <>
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                En Operación
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="size-3 text-slate-500" />
                                Finalizado
                              </>
                            )}
                          </Badge>

                          {/* Duración Badge */}
                          {durationText && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
                              <Hourglass className="size-2.5 text-muted-foreground/70" />
                              {isAbierto ? `Activo: ${durationText}` : durationText}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Fila 2: Cajero Responsable */}
                      <div className="flex items-center gap-2 text-xs text-foreground">
                        <User className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-foreground">
                          {empleadoNombre}
                        </span>
                        {empleadoCodigo && (
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted/40 px-1.5 py-0.2 rounded border border-border/40">
                            ID: {empleadoCodigo}
                          </span>
                        )}
                      </div>

                      {/* Fila 3: Horarios de Apertura y Cierre */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-5 text-xs text-muted-foreground pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground/70" />
                          <span className="text-muted-foreground">Apertura:</span>
                          <span className="font-mono font-medium text-foreground">
                            {formatDate(turno.fechaHoraApertura)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground/70" />
                          <span className="text-muted-foreground">Cierre:</span>
                          {turno.fechaHoraCierre ? (
                            <span className="font-mono font-medium text-foreground">
                              {formatDate(turno.fechaHoraCierre)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold italic flex items-center gap-1">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              En curso actualmente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloque Derecho: Botones de Acción */}
                  <div className="flex items-center justify-end gap-2 shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-border/40">
                    {isAbierto && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onCloseTurno(turno)}
                        className="h-8 px-3 text-xs font-semibold gap-1.5 bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer transition-all"
                        title="Cerrar turno de caja"
                      >
                        <LogOut className="size-3.5" />
                        <span>Cerrar Turno</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(turno)}
                      className="h-8 px-3 text-xs font-semibold gap-1.5 border-border/80 hover:bg-accent hover:text-primary shadow-2xs cursor-pointer bg-background"
                      title="Editar turno"
                    >
                      <Pencil className="size-3.5 text-muted-foreground" />
                      <span>Editar</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(turno)}
                      className="h-8 px-2.5 text-xs font-semibold gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación (Solo si hay más de 10 registros) */}
        {totalItems > 10 && (
          <div className="pt-2 px-0.5">
            <DataTablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              itemLabel="turnos"
            />
          </div>
        )}
      </div>
    </div>
  );
}
