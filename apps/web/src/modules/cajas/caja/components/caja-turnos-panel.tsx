"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SearchInput,
  DataTablePagination,
} from "@/components/shared";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  LogOut,
  Plus,
  RefreshCw,
  Calendar,
  User,
  Vault,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CajaResponse } from "../types/caja.types";
import {
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../../turno-caja/types/turno-caja.types";
import { useTurnosCaja } from "../../turno-caja/hooks/use-turnos-caja";

export type TurnoEstadoFiltro = "TODOS" | "ABIERTOS" | "CERRADOS";

interface CajaTurnosPanelProps {
  selectedCaja: CajaResponse | null;
  onOpenTurno: (caja: CajaResponse) => void;
  onEditTurno: (turno: TurnoCajaResponse) => void;
  onCloseTurno: (turno: TurnoCajaResponse) => void;
  onDeleteTurno: (turno: TurnoCajaResponse) => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function CajaTurnosPanel({
  selectedCaja,
  onOpenTurno,
  onEditTurno,
  onCloseTurno,
  onDeleteTurno,
}: CajaTurnosPanelProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedEstadoTab, setSelectedEstadoTab] = React.useState<TurnoEstadoFiltro>("TODOS");

  // Reset page & search when selected caja changes
  React.useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedEstadoTab("TODOS");
  }, [selectedCaja?.id]);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useTurnosCaja(
    {
      page: currentPage,
      pageSize,
      search: debouncedSearch || undefined,
      cajaId: selectedCaja?.id,
    },
    Boolean(selectedCaja?.id)
  );

  const turnos = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
    ? (apiData as unknown as TurnoCajaResponse[])
    : [];
  const totalItems = apiData?.totalItems ?? turnos.length;

  const filteredTurnos = React.useMemo(() => {
    if (selectedEstadoTab === "ABIERTOS") {
      return turnos.filter((t) => t.estado === EstadoTurnoCaja.Abierto);
    }
    if (selectedEstadoTab === "CERRADOS") {
      return turnos.filter((t) => t.estado === EstadoTurnoCaja.Cerrado);
    }
    return turnos;
  }, [turnos, selectedEstadoTab]);

  const turnosAbiertos = turnos.filter((t) => t.estado === EstadoTurnoCaja.Abierto).length;
  const turnosCerrados = turnos.filter((t) => t.estado === EstadoTurnoCaja.Cerrado).length;

  const tabs: Array<{
    key: TurnoEstadoFiltro;
    label: string;
    activeClasses: string;
  }> = [
    { key: "TODOS", label: "Todos", activeClasses: "bg-primary text-primary-foreground shadow-xs" },
    { key: "ABIERTOS", label: "Abiertos", activeClasses: "bg-emerald-600 text-white shadow-xs" },
    { key: "CERRADOS", label: "Cerrados", activeClasses: "bg-slate-600 text-white shadow-xs" },
  ];

  if (!selectedCaja) {
    return (
      <div className="h-full min-h-[360px] rounded-xl border border-dashed border-border/70 bg-card/40 flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="size-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground/60">
          <Vault className="size-6" />
        </div>
        <div className="space-y-1 max-w-sm">
          <p className="text-sm font-semibold text-foreground">Ningún punto de caja seleccionado</p>
          <p className="text-xs text-muted-foreground">
            Seleccione una caja de la lista izquierda para ver su historial de turnos, aperturas y cierres.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full rounded-xl border border-border/60 bg-card p-4 shadow-2xs">
      {/* Cabecera del Panel Detalle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Vault className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                {selectedCaja.codigo}
              </span>
              <h2 className="text-sm font-bold text-foreground">
                {selectedCaja.nombre}
              </h2>
              <Badge
                variant={selectedCaja.activo ? "default" : "secondary"}
                className={`text-[10px] px-2 py-0.2 ${
                  selectedCaja.activo
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {selectedCaja.activo ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gestión de turnos, cajeros asignados y movimientos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenTurno(selectedCaja)}
            className="h-8 gap-1.5 text-xs font-semibold px-3 cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Abrir Turno</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            className="size-8 cursor-pointer"
            title="Actualizar turnos"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Mini Métricas de la Caja Seleccionada */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg border border-border/40 bg-muted/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Total Turnos</p>
            <p className="text-base font-bold text-foreground mt-0.5">{totalItems}</p>
          </div>
          <Clock className="size-4 text-primary/60" />
        </div>

        <div className="p-2.5 rounded-lg border border-border/40 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 uppercase">Abiertos</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{turnosAbiertos}</p>
          </div>
          <CheckCircle2 className="size-4 text-emerald-600/60" />
        </div>

        <div className="p-2.5 rounded-lg border border-border/40 bg-slate-500/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase">Cerrados</p>
            <p className="text-base font-bold text-slate-600 dark:text-slate-400 mt-0.5">{turnosCerrados}</p>
          </div>
          <XCircle className="size-4 text-slate-500/60" />
        </div>
      </div>

      {/* Filtros de Estado y Buscador de Turnos */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedEstadoTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setSelectedEstadoTab(t.key);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1 px-3 py-0.8 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? t.activeClasses
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-60">
          <SearchInput
            value={searchTerm}
            onChange={(term) => {
              setSearchTerm(term);
              setCurrentPage(1);
            }}
            placeholder="Buscar por cajero..."
            className="h-8 text-xs bg-background shadow-2xs"
          />
        </div>
      </div>

      {/* Lista de Turnos */}
      <div className="space-y-1.5 pt-1">
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-border/50 bg-card space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        ) : filteredTurnos.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-2">
            <Clock className="size-7 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-xs text-foreground">No se encontraron turnos para esta caja</p>
            <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
              {searchTerm
                ? "Intente ajustar el término de búsqueda o filtro seleccionado."
                : "Haga clic en 'Abrir Turno' para iniciar una nueva jornada en este punto de caja."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredTurnos.map((turno) => {
              const isAbierto = turno.estado === EstadoTurnoCaja.Abierto;
              const empleadoNombre = turno.empleado?.nombreCompleto || "Sin cajero asignado";

              return (
                <div
                  key={turno.id}
                  className="group p-3 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-muted/25 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
                >
                  {/* Bloque Izquierdo: Icono + Cajero + Fechas */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`size-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border mt-0.5 transition-colors ${
                        isAbierto
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white"
                          : "bg-muted text-muted-foreground border-border group-hover:bg-primary group-hover:text-primary-foreground"
                      }`}
                    >
                      <Clock className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {empleadoNombre}
                        </span>
                        {turno.empleado?.codigoEmpleado && (
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1 rounded">
                            {turno.empleado.codigoEmpleado}
                          </span>
                        )}
                      </div>

                      {/* Fechas de Apertura y Cierre */}
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-emerald-600/70 shrink-0" />
                          <span>Apertura: <strong>{formatDate(turno.fechaHoraApertura)}</strong></span>
                        </span>

                        {turno.fechaHoraCierre && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="flex items-center gap-1">
                              <LogOut className="size-3 text-muted-foreground/70 shrink-0" />
                              <span>Cierre: <strong>{formatDate(turno.fechaHoraCierre)}</strong></span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bloque Derecho: Estado & Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    <Badge
                      variant={isAbierto ? "default" : "secondary"}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isAbierto
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {isAbierto ? "Abierto" : "Cerrado"}
                    </Badge>

                    <div className="flex items-center gap-1">
                      {isAbierto && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onCloseTurno(turno)}
                          className="h-7 px-2 text-[11px] font-semibold gap-1 bg-amber-600 hover:bg-amber-700 text-white shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
                          title="Cerrar este turno de caja"
                        >
                          <LogOut className="size-3" />
                          <span>Cerrar</span>
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onEditTurno(turno)}
                        className="h-7 px-2 text-[11px] font-medium gap-1 text-foreground hover:bg-accent cursor-pointer"
                        title="Editar detalle del turno"
                      >
                        <Pencil className="size-3 text-blue-600 dark:text-blue-400" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger className="size-7 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-border/60 cursor-pointer">
                          <MoreVertical className="size-3.5" />
                          <span className="sr-only">Más opciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 text-xs">
                          <DropdownMenuLabel className="text-[11px]">Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {isAbierto && (
                            <DropdownMenuItem
                              onClick={() => onCloseTurno(turno)}
                              className="gap-2 text-amber-600 dark:text-amber-400 font-medium cursor-pointer"
                            >
                              <LogOut className="size-3.5" />
                              <span>Cerrar Turno</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onEditTurno(turno)}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="size-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Editar Detalle</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteTurno(turno)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación de Turnos */}
        {totalItems > 10 && (
          <div className="pt-2 px-1">
            <DataTablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
