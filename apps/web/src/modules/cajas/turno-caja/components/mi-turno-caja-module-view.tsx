"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Clock,
  Coins,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
  Vault,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useCajas } from "@/modules/cajas/caja/hooks/use-cajas";
import type { CajaResponse } from "@/modules/cajas/caja/types/caja.types";
import {
  useMiSesionTurnoCaja,
  useMisTurnosCaja,
} from "../hooks/use-turnos-caja";
import {
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../types/turno-caja.types";
import { TurnoCajaMetrics } from "./turno-caja-metrics";
import { TurnoCajaList } from "./turno-caja-list";
import { TurnoCajaFormDialog } from "./turno-caja-form-dialog";

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount?: number | null): string {
  return `Bs. ${Number(amount || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function MiTurnoCajaModuleView() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ABIERTOS" | "CERRADOS"
  >("TODOS");
  const [selectedCajaFilter, setSelectedCajaFilter] =
    React.useState<string>("ALL");
  const [soloPropio, setSoloPropio] = React.useState<boolean>(true);

  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"open" | "close">("open");
  const [turnoToClose, setTurnoToClose] =
    React.useState<TurnoCajaResponse | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: miSesion,
    isLoading: isLoadingSesion,
    refetch: refetchSesion,
  } = useMiSesionTurnoCaja();

  const {
    data: turnosData,
    isLoading: isLoadingTurnos,
    refetch: refetchTurnos,
  } = useMisTurnosCaja({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
    cajaId:
      selectedCajaFilter !== "ALL" ? Number(selectedCajaFilter) : undefined,
    soloPropio,
  });

  const { data: cajasData } = useCajas({ page: 1, pageSize: 100 });

  const turnosList: TurnoCajaResponse[] = React.useMemo(() => {
    return Array.isArray(turnosData?.items)
      ? turnosData.items
      : Array.isArray(turnosData)
      ? (turnosData as unknown as TurnoCajaResponse[])
      : [];
  }, [turnosData]);

  const cajasList: CajaResponse[] = React.useMemo(() => {
    return Array.isArray(cajasData?.items)
      ? cajasData.items
      : Array.isArray(cajasData)
      ? (cajasData as unknown as CajaResponse[])
      : [];
  }, [cajasData]);

  const totalItems = turnosData?.totalItems ?? turnosList.length;

  const filteredTurnos = React.useMemo(() => {
    return turnosList.filter((turno) => {
      if (selectedStatusTab === "ABIERTOS") {
        return turno.estado === EstadoTurnoCaja.Abierto;
      }
      if (selectedStatusTab === "CERRADOS") {
        return turno.estado === EstadoTurnoCaja.Cerrado;
      }
      return true;
    });
  }, [turnosList, selectedStatusTab]);

  const metrics = React.useMemo(() => {
    let abiertos = 0;
    let cerrados = 0;

    turnosList.forEach((t) => {
      if (t.estado === EstadoTurnoCaja.Abierto) abiertos++;
      else if (t.estado === EstadoTurnoCaja.Cerrado) cerrados++;
    });

    return {
      totalTurnos: totalItems,
      turnosAbiertos: abiertos,
      turnosCerrados: cerrados,
    };
  }, [turnosList, totalItems]);

  const handleRefreshAll = () => {
    refetchSesion();
    refetchTurnos();
  };

  const handleOpenCreateModal = () => {
    setTurnoToClose(null);
    setFormMode("open");
    setFormDialogOpen(true);
  };

  const handleCloseTurno = (turno: TurnoCajaResponse) => {
    setTurnoToClose(turno);
    setFormMode("close");
    setFormDialogOpen(true);
  };

  const cajeroNombre =
    miSesion?.empleado?.nombreCompleto ||
    miSesion?.nombreCompleto ||
    user?.nombreCompleto ||
    user?.userName ||
    "Cajero en Sesión";

  const cajeroCodigo = miSesion?.empleado?.codigoEmpleado;
  const turnoAbiertoActual = miSesion?.turnoAbierto;
  const esAdmin = Boolean(miSesion?.esAdministrador);
  const sinEmpleadoVinculado = Boolean(!isLoadingSesion && miSesion && !miSesion.empleado);

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera Personal del Cajero Logueado */}
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <UserCheck className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  Mi Turno de Caja
                </h1>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20"
                >
                  {cajeroNombre}
                </Badge>
                {cajeroCodigo && (
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {cajeroCodigo}
                  </Badge>
                )}
                {esAdmin && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"
                  >
                    <ShieldCheck className="size-3" />
                    Administrador
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gestione la apertura, arqueo y cierre de su caja asignada en su sesión actual.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Si es administrador puede alternar entre ver solo sus turnos o ver todos */}
            {esAdmin && (
              <div className="inline-flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setSoloPropio(true);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                    soloPropio
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <UserCheck className="size-3.5" />
                  Mis Turnos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSoloPropio(false);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                    !soloPropio
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Users className="size-3.5" />
                  Todos (Admin)
                </button>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="h-8.5 text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              Actualizar
            </Button>

            {!turnoAbiertoActual && (
              <Button
                type="button"
                size="sm"
                onClick={handleOpenCreateModal}
                disabled={sinEmpleadoVinculado}
                className="h-8.5 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="size-3.5" />
                Abrir Mi Turno
              </Button>
            )}
          </div>
        </div>

        {/* Estado del Turno Activo en Sesión */}
        {sinEmpleadoVinculado && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Su usuario actual (<strong>@{miSesion?.userName}</strong>) no cuenta con una ficha de empleado vinculada.{" "}
              {esAdmin
                ? "Como administrador puede visualizar todos los turnos activando la pestaña 'Todos (Admin)'."
                : "Solicite al área de Recursos Humanos vincular su cuenta a un registro de empleado."}
            </span>
          </div>
        )}

        {turnoAbiertoActual && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="size-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Vault className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    Turno Activo #{turnoAbiertoActual.id}:{" "}
                    {turnoAbiertoActual.caja
                      ? `${turnoAbiertoActual.caja.codigo} - ${turnoAbiertoActual.caja.nombre}`
                      : "Caja Asignada"}
                  </span>
                  <Badge className="text-[10px] bg-emerald-600 text-white hover:bg-emerald-600">
                    En Operación
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="size-3" />
                    Apertura: {formatDateTime(turnoAbiertoActual.fechaHoraApertura)}
                  </span>
                  <span className="flex items-center gap-1 font-mono font-semibold text-foreground">
                    <Coins className="size-3 text-emerald-600" />
                    Fondo Inicial: {formatCurrency(turnoAbiertoActual.montoInicial)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/caja/arqueos/nuevo?turnoId=${turnoAbiertoActual.id}`)
                }
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <Calculator className="size-3.5 text-emerald-600" />
                Realizar Arqueo
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleCloseTurno(turnoAbiertoActual)}
                className="h-8 px-3 text-xs font-semibold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-2xs"
              >
                <LogOut className="size-3.5" />
                Cerrar Mi Turno
              </Button>
            </div>
          </div>
        )}
      </div>

      <TurnoCajaMetrics
        metrics={metrics}
        selectedFilter={selectedStatusTab}
        onFilterChange={(f: "TODOS" | "ABIERTOS" | "CERRADOS") => {
          setSelectedStatusTab(f);
          setCurrentPage(1);
        }}
      />

      <TurnoCajaList
        turnos={filteredTurnos}
        cajas={cajasList}
        counts={{
          total: totalItems,
          abiertos: metrics.turnosAbiertos,
          cerrados: metrics.turnosCerrados,
        }}
        isLoading={isLoadingTurnos || isLoadingSesion}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedStatusTab={selectedStatusTab}
        selectedCajaFilter={selectedCajaFilter}
        onStatusTabChange={(tab) => {
          setSelectedStatusTab(tab);
          setCurrentPage(1);
        }}
        onCajaFilterChange={(cajaId) => {
          setSelectedCajaFilter(cajaId);
          setCurrentPage(1);
        }}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onCloseTurno={handleCloseTurno}
        onNewTurnoClick={handleOpenCreateModal}
        onRefresh={handleRefreshAll}
      />

      <TurnoCajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        turnoToClose={turnoToClose}
        mode={formMode}
        personalMode={true}
        sessionData={miSesion}
        onSuccessCallback={handleRefreshAll}
      />
    </div>
  );
}

