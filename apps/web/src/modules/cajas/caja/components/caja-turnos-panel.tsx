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
  Coins,
  ChevronRight,
  Info,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CajaResponse } from "../types/caja.types";
import {
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../../turno-caja/types/turno-caja.types";
import { useTurnosCaja } from "../../turno-caja/hooks/use-turnos-caja";
import {
  useAperturasCaja,
  useDeleteAperturaCaja,
} from "../../apertura-caja/hooks/use-aperturas-caja";
import type { AperturaCajaResponse } from "../../apertura-caja/types/apertura-caja.types";
import { AperturaCajaFormDialog } from "../../apertura-caja/components/apertura-caja-form-dialog";
import { AperturaCajaDeleteDialog } from "../../apertura-caja/components/apertura-caja-delete-dialog";
import { toast } from "sonner";

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

function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null) return "S/ 0.00";
  return `S/ ${Number(amount).toFixed(2)}`;
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

  // Estado del Turno Seleccionado (Maestro)
  const [selectedTurnoId, setSelectedTurnoId] = React.useState<number | null>(null);

  // Dialogs de Apertura de Caja (Detalle del Turno)
  const [aperturaFormOpen, setAperturaFormOpen] = React.useState(false);
  const [aperturaToEdit, setAperturaToEdit] = React.useState<AperturaCajaResponse | null>(null);
  const [aperturaTargetTurno, setAperturaTargetTurno] = React.useState<TurnoCajaResponse | null>(null);
  const [aperturaDeleteOpen, setAperturaDeleteOpen] = React.useState(false);
  const [aperturaToDelete, setAperturaToDelete] = React.useState<AperturaCajaResponse | null>(null);

  const deleteAperturaMutation = useDeleteAperturaCaja();

  // Reset al cambiar de caja
  React.useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedTurnoId(null);
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
    isLoading: isLoadingTurnos,
    refetch: refetchTurnos,
  } = useTurnosCaja(
    {
      page: currentPage,
      pageSize,
      search: debouncedSearch || undefined,
      cajaId: selectedCaja?.id,
    },
    Boolean(selectedCaja?.id)
  );

  // Fetch de todas las aperturas para vincularlas instantáneamente por TurnoCajaId
  const {
    data: aperturasData,
    isLoading: isLoadingAperturas,
    refetch: refetchAperturas,
  } = useAperturasCaja(
    { pageSize: 100 },
    Boolean(selectedCaja?.id)
  );

  const turnos = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
      ? (apiData as unknown as TurnoCajaResponse[])
      : [];
  const totalItems = apiData?.totalItems ?? turnos.length;

  const aperturasList = Array.isArray(aperturasData?.items)
    ? aperturasData.items
    : Array.isArray(aperturasData)
      ? (aperturasData as unknown as AperturaCajaResponse[])
      : [];

  // Mapa de Apertura por TurnoCajaId para acceso O(1)
  const aperturasMap = React.useMemo(() => {
    const map = new Map<number, AperturaCajaResponse>();
    for (const ap of aperturasList) {
      if (ap.turnoCaja?.id) {
        map.set(ap.turnoCaja.id, ap);
      }
    }
    return map;
  }, [aperturasList]);

  // Auto-seleccionar primer turno disponible si no hay seleccionado
  React.useEffect(() => {
    if (turnos.length > 0) {
      if (!selectedTurnoId || !turnos.some((t) => t.id === selectedTurnoId)) {
        // Preferir turno abierto o el primero
        const openTurno = turnos.find((t) => t.estado === EstadoTurnoCaja.Abierto);
        setSelectedTurnoId(openTurno ? openTurno.id : turnos[0].id);
      }
    } else {
      setSelectedTurnoId(null);
    }
  }, [turnos, selectedTurnoId]);

  const selectedTurno = React.useMemo(() => {
    return turnos.find((t) => t.id === selectedTurnoId) || null;
  }, [turnos, selectedTurnoId]);

  const selectedTurnoApertura = React.useMemo(() => {
    if (!selectedTurnoId) return null;
    return aperturasMap.get(selectedTurnoId) || null;
  }, [selectedTurnoId, aperturasMap]);

  const turnosAbiertos = turnos.filter((t) => t.estado === EstadoTurnoCaja.Abierto).length;
  const turnosCerrados = turnos.filter((t) => t.estado === EstadoTurnoCaja.Cerrado).length;

  // Handlers para Apertura de Caja
  const handleOpenCreateApertura = (turno: TurnoCajaResponse) => {
    setAperturaTargetTurno(turno);
    setAperturaToEdit(null);
    setAperturaFormOpen(true);
  };

  const handleOpenEditApertura = (apertura: AperturaCajaResponse, turno: TurnoCajaResponse) => {
    setAperturaTargetTurno(turno);
    setAperturaToEdit(apertura);
    setAperturaFormOpen(true);
  };

  const handlePromptDeleteApertura = (apertura: AperturaCajaResponse) => {
    setAperturaToDelete(apertura);
    setAperturaDeleteOpen(true);
  };

  const handleConfirmDeleteApertura = async () => {
    if (!aperturaToDelete) return;
    try {
      await deleteAperturaMutation.mutateAsync(aperturaToDelete.id);
      toast.success("Apertura de caja eliminada correctamente.");
      setAperturaDeleteOpen(false);
      setAperturaToDelete(null);
      refetchAperturas();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(err.response?.data?.detail || err.message || "Error al eliminar la apertura.");
    }
  };

  if (!selectedCaja) {
    return (
      <div className="h-full min-h-[360px] rounded-xl border border-dashed border-border/70 bg-card/40 flex flex-col items-center justify-center p-8 text-center space-y-2.5">
        <div className="size-10 rounded-xl bg-muted/80 flex items-center justify-center text-muted-foreground/60">
          <Vault className="size-5" />
        </div>
        <div className="space-y-1 max-w-sm">
          <p className="text-xs font-bold text-foreground">Ninguna caja seleccionada</p>
          <p className="text-[11px] text-muted-foreground">
            Haga clic en una caja de la lista izquierda para ver y gestionar sus turnos y aperturas.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingTurnos || isLoadingAperturas;

  return (
    <div className="flex flex-col h-full rounded-xl border border-border/60 bg-card p-3 shadow-2xs space-y-2.5">
      {/* Cabecera del Panel */}
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
            onClick={() => {
              refetchTurnos();
              refetchAperturas();
            }}
            disabled={isLoading}
            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Mini Cinta de Métricas */}
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

      {/* DETALLE DE APERTURA DEL TURNO SELECCIONADO */}
      {selectedTurno && (
        <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/[0.03] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Coins className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-foreground truncate">
                Fondo Inicial del Turno #{selectedTurno.id}
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                ({selectedTurno.empleado?.nombreCompleto || "Cajero"})
              </span>
            </div>

            {selectedTurnoApertura ? (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEditApertura(selectedTurnoApertura, selectedTurno)}
                  className="h-6 px-2 text-[10px] font-medium gap-1 cursor-pointer"
                >
                  <Pencil className="size-2.5 text-amber-600" />
                  <span>Editar Fondo</span>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handlePromptDeleteApertura(selectedTurnoApertura)}
                  className="size-6 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  title="Eliminar apertura"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => handleOpenCreateApertura(selectedTurno)}
                className="h-6 px-2 text-[10px] font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
              >
                <Plus className="size-3" />
                <span>Registrar Fondo Inicial</span>
              </Button>
            )}
          </div>

          {selectedTurnoApertura ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-primary/20">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Monto Inicial</p>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrency(selectedTurnoApertura.montoInicial)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Fecha Registro</p>
                <p className="font-mono text-foreground font-medium">
                  {formatDate(selectedTurnoApertura.fechaHora)}
                </p>
              </div>
              <div className="sm:col-span-1">
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Observación</p>
                <p className="text-muted-foreground truncate">
                  {selectedTurnoApertura.observacion || "Sin observaciones"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
              <Info className="size-3.5 shrink-0 text-amber-600" />
              <span className="truncate">
                Este turno aún no tiene registrado su saldo base o fondo inicial en efectivo.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Lista de Turnos (Maestro) con Scroll */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-420px)] min-h-[220px] space-y-1.5 pr-0.5 scrollbar-thin">
        {isLoadingTurnos ? (
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
              const isSelected = selectedTurnoId === turno.id;
              const empleadoNombre = turno.empleado?.nombreCompleto || "Sin cajero asignado";
              const apertura = aperturasMap.get(turno.id);

              return (
                <div
                  key={turno.id}
                  onClick={() => setSelectedTurnoId(turno.id)}
                  className={`group p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isSelected
                      ? "border-primary bg-primary/[0.07] ring-1 ring-primary/40 shadow-xs border-l-[3.5px] border-l-primary"
                      : isAbierto
                      ? "border-emerald-500/40 bg-emerald-500/[0.03] hover:border-emerald-500/60 hover:bg-emerald-500/[0.06] border-l-[3.5px] border-l-emerald-600"
                      : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  {/* Bloque Izquierdo: Icono + Cajero + Fechas + Chip Fondo */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`size-7.5 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : isAbierto
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

                        {/* Indicador de Apertura / Saldo Base */}
                        {apertura ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            <Coins className="size-2.5" />
                            <span>{formatCurrency(apertura.montoInicial)}</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-amber-600 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                            Sin fondo
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

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                        <DropdownMenuContent align="end" className="w-38 text-xs">
                          <DropdownMenuLabel className="text-[10px]">Turno #{turno.id}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {apertura ? (
                            <DropdownMenuItem
                              onClick={() => handleOpenEditApertura(apertura, turno)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Coins className="size-3 text-emerald-600" />
                              <span>Editar Fondo Inicial</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleOpenCreateApertura(turno)}
                              className="gap-2 text-emerald-600 font-medium cursor-pointer text-xs"
                            >
                              <Plus className="size-3" />
                              <span>Registrar Fondo Inicial</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onEditTurno(turno)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Pencil className="size-3 text-blue-600" />
                            <span>Editar Detalle Turno</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteTurno(turno)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer text-xs"
                          >
                            <Trash2 className="size-3" />
                            <span>Eliminar Turno</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <ChevronRight
                        className={`size-3.5 transition-transform ${
                          isSelected
                            ? "text-primary translate-x-0.5"
                            : "text-muted-foreground/40 group-hover:text-muted-foreground"
                        }`}
                      />
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

      {/* Modales de Apertura de Caja */}
      {aperturaTargetTurno && (
        <AperturaCajaFormDialog
          open={aperturaFormOpen}
          onOpenChange={setAperturaFormOpen}
          turnoCajaId={aperturaTargetTurno.id}
          cajeroNombre={aperturaTargetTurno.empleado?.nombreCompleto}
          cajaNombre={selectedCaja.nombre}
          aperturaToEdit={aperturaToEdit}
          onSuccessCallback={() => refetchAperturas()}
        />
      )}

      <AperturaCajaDeleteDialog
        open={aperturaDeleteOpen}
        onOpenChange={setAperturaDeleteOpen}
        apertura={aperturaToDelete}
        onConfirm={handleConfirmDeleteApertura}
        isLoading={deleteAperturaMutation.isPending}
      />
    </div>
  );
}
