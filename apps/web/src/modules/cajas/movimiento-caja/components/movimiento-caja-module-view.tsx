"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { movimientoCajaKeys } from "../api/movimiento-caja.key";
import {
  useDeleteMovimientoCaja,
  useMovimientosCaja,
} from "../hooks/use-movimientos-caja";
import { useTurnosCaja } from "../../turno-caja/hooks/use-turnos-caja";
import { MovimientoCajaHeader } from "./movimiento-caja-header";
import { MovimientoCajaMetrics } from "./movimiento-caja-metrics";
import { MovimientoCajaTable } from "./movimiento-caja-table";
import { MovimientoCajaFormDialog } from "./movimiento-caja-form-dialog";
import { MovimientoCajaDeleteDialog } from "./movimiento-caja-delete-dialog";
import { MovimientoCajaDetailSheet } from "./movimiento-caja-detail-sheet";
import type { MovimientoCajaResponse } from "../types/movimiento-caja.types";

export function MovimientoCajaModuleView() {
  const queryClient = useQueryClient();

  // Paginación y búsqueda
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filtros
  const [selectedTurnoId, setSelectedTurnoId] = React.useState<number | null>(
    null
  );
  const [filtroNaturaleza, setFiltroNaturaleza] = React.useState<
    "TODOS" | "ENTRADA" | "SALIDA"
  >("TODOS");
  const [fechaDesde, setFechaDesde] = React.useState<string>("");
  const [fechaHasta, setFechaHasta] = React.useState<string>("");

  // Estados de diálogo
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [movimientoToEdit, setMovimientoToEdit] =
    React.useState<MovimientoCajaResponse | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [movimientoToDelete, setMovimientoToDelete] =
    React.useState<MovimientoCajaResponse | null>(null);

  // Sheet de Detalle
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [selectedMovimientoDetail, setSelectedMovimientoDetail] =
    React.useState<MovimientoCajaResponse | null>(null);

  // Turnos de caja activos para el filtro en la cabecera
  const { data: turnosData } = useTurnosCaja({ page: 1, pageSize: 50 });
  const turnosList = React.useMemo(() => {
    return Array.isArray(turnosData?.items)
      ? turnosData.items
      : Array.isArray(turnosData)
      ? turnosData
      : [];
  }, [turnosData]);

  // Consulta de movimientos de caja
  const {
    data: apiData,
    isLoading,
    isRefetching,
    refetch,
  } = useMovimientosCaja({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
    turnoCajaId: selectedTurnoId || undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  });

  const deleteMutation = useDeleteMovimientoCaja();

  // Normalización de movimientos
  const movimientos: MovimientoCajaResponse[] = React.useMemo(() => {
    if (Array.isArray(apiData?.items)) return apiData.items;
    if (Array.isArray(apiData))
      return apiData as unknown as MovimientoCajaResponse[];
    return [];
  }, [apiData]);

  const totalItems = apiData?.totalItems ?? movimientos.length;

  // Filtrado de movimientos por naturaleza
  const movimientosFiltrados = React.useMemo(() => {
    if (filtroNaturaleza === "TODOS") return movimientos;
    return movimientos.filter((m) => {
      const isEntrada =
        m.naturalezaAplicada?.toUpperCase() === "ENTRADA" ||
        m.tipoMovimientoCaja?.naturaleza?.toUpperCase() === "ENTRADA";
      return filtroNaturaleza === "ENTRADA" ? isEntrada : !isEntrada;
    });
  }, [movimientos, filtroNaturaleza]);

  // Cálculo de métricas
  const metrics = React.useMemo(() => {
    let ingresos = 0;
    let egresos = 0;

    movimientos.forEach((m) => {
      const monto = Number(m.montoMonedaBase ?? m.monto);
      const isIngreso =
        m.naturalezaAplicada?.toUpperCase() === "ENTRADA" ||
        m.tipoMovimientoCaja?.naturaleza?.toUpperCase() === "ENTRADA";

      if (isIngreso) {
        ingresos += monto;
      } else {
        egresos += monto;
      }
    });

    return {
      totalMovimientos: totalItems,
      totalIngresos: ingresos,
      totalEgresos: egresos,
      balanceNeto: ingresos - egresos,
    };
  }, [movimientos, totalItems]);

  // Handlers memoizados
  const handleSearchChange = React.useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleTurnoChange = React.useCallback((turnoId: number | null) => {
    setSelectedTurnoId(turnoId);
    setCurrentPage(1);
  }, []);

  const handleFiltroNaturalezaChange = React.useCallback(
    (filtro: "TODOS" | "ENTRADA" | "SALIDA") => {
      setFiltroNaturaleza(filtro);
      setCurrentPage(1);
    },
    []
  );

  const handleDateRangeChange = React.useCallback(
    (desde: string, hasta: string) => {
      setFechaDesde(desde);
      setFechaHasta(hasta);
      setCurrentPage(1);
    },
    []
  );

  const handleFechaDesdeChange = React.useCallback((val: string) => {
    setFechaDesde(val);
    setCurrentPage(1);
  }, []);

  const handleFechaHastaChange = React.useCallback((val: string) => {
    setFechaHasta(val);
    setCurrentPage(1);
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = React.useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleRefresh = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
    void refetch();
  }, [queryClient, refetch]);

  const handleOpenCreateModal = React.useCallback(() => {
    setMovimientoToEdit(null);
    setFormDialogOpen(true);
  }, []);

  const handleEdit = React.useCallback((mov: MovimientoCajaResponse) => {
    setMovimientoToEdit(mov);
    setFormDialogOpen(true);
  }, []);

  const handleViewDetail = React.useCallback((mov: MovimientoCajaResponse) => {
    setSelectedMovimientoDetail(mov);
    setDetailSheetOpen(true);
  }, []);

  const handlePromptDelete = React.useCallback(
    (mov: MovimientoCajaResponse) => {
      setMovimientoToDelete(mov);
      setDeleteDialogOpen(true);
    },
    []
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!movimientoToDelete) return;
    try {
      await deleteMutation.mutateAsync(movimientoToDelete.id);
      toast.success("Movimiento de caja eliminado correctamente.");
      setDeleteDialogOpen(false);
      setMovimientoToDelete(null);
      if (selectedMovimientoDetail?.id === movimientoToDelete.id) {
        setDetailSheetOpen(false);
        setSelectedMovimientoDetail(null);
      }
      handleRefresh();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Error al eliminar el movimiento de caja."
      );
    }
  }, [
    deleteMutation,
    movimientoToDelete,
    selectedMovimientoDetail,
    handleRefresh,
  ]);

  const isRefreshing = isLoading || isRefetching;

  return (
    <div className="space-y-4 w-full animate-in fade-in-50 duration-200">
      {/* Cabecera Principal Limpia y Profesional */}
      <MovimientoCajaHeader
        onNewMovimientoClick={handleOpenCreateModal}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Métricas Financieras en Bolivianos (Bs.) */}
      <MovimientoCajaMetrics metrics={metrics} isLoading={isRefreshing} />

      {/* Tabla con Filtros de Caja/Turno, Naturaleza, Búsqueda y Paginación */}
      <MovimientoCajaTable
        movimientos={movimientosFiltrados}
        isLoading={isRefreshing}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        filtroNaturaleza={filtroNaturaleza}
        turnos={turnosList}
        selectedTurnoId={selectedTurnoId}
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onFechaDesdeChange={handleFechaDesdeChange}
        onFechaHastaChange={handleFechaHastaChange}
        onDateRangeChange={handleDateRangeChange}
        onTurnoChange={handleTurnoChange}
        onFiltroNaturalezaChange={handleFiltroNaturalezaChange}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handlePromptDelete}
        onRefresh={handleRefresh}
      />

      {/* Diálogo de Registro y Edición */}
      <MovimientoCajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        movimientoToEdit={movimientoToEdit}
        onSuccessCallback={handleRefresh}
      />

      {/* Diálogo de Confirmación de Eliminación */}
      <MovimientoCajaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        movimiento={movimientoToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Panel Lateral de Detalle Completo */}
      <MovimientoCajaDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        movimiento={selectedMovimientoDetail}
        onDelete={handlePromptDelete}
      />
    </div>
  );
}
