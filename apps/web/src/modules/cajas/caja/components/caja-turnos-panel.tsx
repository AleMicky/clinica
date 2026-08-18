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
  Vault,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CajaResponse } from "../types/caja.types";
import {
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../../turno-caja/types/turno-caja.types";
import { useTurnosCaja } from "../../turno-caja/hooks/use-turnos-caja";

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

  // Reset al cambiar de caja
  React.useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setDebouncedSearch("");
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

  const turnosAbiertos = turnos.filter((t) => t.estado === EstadoTurnoCaja.Abierto).length;
  const turnosCerrados = turnos.filter((t) => t.estado === EstadoTurnoCaja.Cerrado).length;

  if (!selectedCaja) {
    return (
      <div className="h-full min-h-[360px] rounded-xl border border-dashed border-border/70 bg-card/40 flex flex-col items-center justify-center p-8 text-center space-y-2.5">
        <div className="size-10 rounded-xl bg-muted/80 flex items-center justify-center text-muted-foreground/60">
          <Vault className="size-5" />
        </div>
        <div className="space-y-1 max-w-sm">
          <p className="text-xs font-bold text-foreground">Ninguna caja seleccionada</p>
          <p className="text-[11px] text-muted-foreground">
            Haga clic en una caja de la lista izquierda para ver y gestionar sus turnos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-border/60 bg-card p-3 shadow-2xs space-y-2.5">
      {/* Cabecera del Panel Detalle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
            {selectedCaja.codigo}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-foreground truncate">
                {selectedCaja.nombre}
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded-full border ${
                  selectedCaja.activo
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    selectedCaja.activo ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {selectedCaja.activo ? "Activa" : "Inactiva"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenTurno(selectedCaja)}
            className="h-7.5 gap-1 text-xs font-semibold px-2.5 cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Abrir Turno</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Actualizar turnos"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Mini Cinta de Métricas de la Caja */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/20">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Total Turnos</span>
          <span className="font-bold text-foreground font-mono">{totalItems}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1">
            <span className="relative flex size-1.5">
              {turnosAbiertos > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
            </span>
            Abiertos
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {turnosAbiertos}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-slate-500/5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Cerrados</span>
          <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">{turnosCerrados}</span>
        </div>
      </div>

      {/* Buscador de Turnos */}
      <div className="w-full">
        <SearchInput
          value={searchTerm}
          onChange={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          placeholder="Buscar por cajero / empleado responsable..."
          className="h-7.5 text-xs bg-muted/30 shadow-none border-border/60 focus:bg-background"
        />
      </div>

      {/* Lista de Turnos con Scroll */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-360px)] min-h-[260px] space-y-1.5 pr-0.5 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg border border-border/40 bg-card/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3.5 w-14" />
                </div>
                <Skeleton className="h-3.5 w-40" />
              </div>
            ))}
          </div>
        ) : turnos.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-border/60 rounded-lg bg-muted/10 space-y-1.5">
            <Clock className="size-6 text-muted-foreground/40 mx-auto" />
            <p className="font-semibold text-xs text-foreground">No hay turnos registrados en esta caja</p>
            <p className="text-[10px] max-w-[240px] mx-auto text-muted-foreground">
              {searchTerm
                ? "Ajuste el término de búsqueda de cajero."
                : "Haga clic en 'Abrir Turno' para iniciar una nueva jornada en este punto de caja."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {turnos.map((turno) => {
              const isAbierto = turno.estado === EstadoTurnoCaja.Abierto;
              const empleadoNombre = turno.empleado?.nombreCompleto || "Sin cajero asignado";

              return (
                <div
                  key={turno.id}
                  className={`group p-2.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isAbierto
                      ? "border-emerald-500/40 bg-emerald-500/[0.04] shadow-xs border-l-[3.5px] border-l-emerald-600"
                      : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  {/* Bloque Izquierdo: Icono + Cajero + Fechas */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`size-7.5 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                        isAbierto
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      <Clock className="size-3.5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-foreground truncate">
                          {empleadoNombre}
                        </span>
                        {turno.empleado?.codigoEmpleado && (
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1 py-0.2 rounded border border-border/40">
                            {turno.empleado.codigoEmpleado}
                          </span>
                        )}
                      </div>

                      {/* Fechas de Apertura y Cierre */}
                      <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-emerald-600 shrink-0" />
                          <span>Apertura: <strong className="text-foreground/90 font-mono">{formatDate(turno.fechaHoraApertura)}</strong></span>
                        </span>

                        {turno.fechaHoraCierre && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="flex items-center gap-1">
                              <LogOut className="size-3 text-muted-foreground shrink-0" />
                              <span>Cierre: <strong className="text-foreground/90 font-mono">{formatDate(turno.fechaHoraCierre)}</strong></span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bloque Derecho: Estado & Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    <Badge
                      variant={isAbierto ? "default" : "secondary"}
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                        isAbierto
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
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
                          className="h-6.5 px-2 text-[10.5px] font-semibold gap-1 bg-amber-600 hover:bg-amber-700 text-white shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
                          title="Cerrar turno de caja"
                        >
                          <LogOut className="size-3" />
                          <span>Cerrar</span>
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => onEditTurno(turno)}
                        className="size-6.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Editar turno"
                      >
                        <Pencil className="size-3 text-blue-600" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger className="size-6.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-border/50 cursor-pointer">
                          <MoreVertical className="size-3" />
                          <span className="sr-only">Opciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 text-xs">
                          <DropdownMenuLabel className="text-[10px]">Turno</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {isAbierto && (
                            <DropdownMenuItem
                              onClick={() => onCloseTurno(turno)}
                              className="gap-2 text-amber-600 font-medium cursor-pointer text-xs"
                            >
                              <LogOut className="size-3" />
                              <span>Cerrar Turno</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onEditTurno(turno)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Pencil className="size-3 text-blue-600" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteTurno(turno)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer text-xs"
                          >
                            <Trash2 className="size-3" />
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
      </div>

      {/* Paginación Compacta */}
      {totalItems > 10 && (
        <div className="pt-1 border-t border-border/40">
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
  );
}
