"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useTurnosCaja,
  useDeleteTurnoCaja,
} from "../hooks/use-turnos-caja";
import { useCajas } from "@/modules/cajas/caja/hooks/use-cajas";
import { TurnoCajaHeader } from "./turno-caja-header";
import { TurnoCajaMetrics } from "./turno-caja-metrics";
import { TurnoCajaList } from "./turno-caja-list";
import { TurnoCajaFormDialog } from "./turno-caja-form-dialog";
import { TurnoCajaDeleteDialog } from "./turno-caja-delete-dialog";
import {
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../types/turno-caja.types";
import type { CajaResponse } from "@/modules/cajas/caja/types/caja.types";

export function TurnoCajaModuleView() {
  // Estado de Paginación y Filtros
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ABIERTOS" | "CERRADOS"
  >("TODOS");
  const [selectedCajaFilter, setSelectedCajaFilter] = React.useState<string>("ALL");

  // Dialogs de Turno
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit" | "close">("create");
  const [turnoToEdit, setTurnoToEdit] = React.useState<TurnoCajaResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [turnoToDelete, setTurnoToDelete] = React.useState<TurnoCajaResponse | null>(null);

  // Debounce búsqueda
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const cajaIdParam =
    selectedCajaFilter !== "ALL" ? Number(selectedCajaFilter) : undefined;

  // Turnos Query
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useTurnosCaja({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
    cajaId: cajaIdParam,
  });

  // Cajas Query for dropdown filter
  const { data: cajasApiData } = useCajas({
    page: 1,
    pageSize: 100,
  });

  const deleteMutation = useDeleteTurnoCaja();

  const allTurnos: TurnoCajaResponse[] = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
    ? (apiData as unknown as TurnoCajaResponse[])
    : [];

  const cajasList: CajaResponse[] = Array.isArray(cajasApiData?.items)
    ? cajasApiData.items
    : Array.isArray(cajasApiData)
    ? (cajasApiData as unknown as CajaResponse[])
    : [];

  const totalItems = apiData?.totalItems ?? allTurnos.length;

  // Filtrado local por pestaña de estado
  const filteredTurnos = React.useMemo(() => {
    if (selectedStatusTab === "ABIERTOS") {
      return allTurnos.filter((t) => t.estado === EstadoTurnoCaja.Abierto);
    }
    if (selectedStatusTab === "CERRADOS") {
      return allTurnos.filter((t) => t.estado === EstadoTurnoCaja.Cerrado);
    }
    return allTurnos;
  }, [allTurnos, selectedStatusTab]);

  const metrics = React.useMemo(() => {
    return {
      totalTurnos: totalItems,
      turnosAbiertos: allTurnos.filter((t) => t.estado === EstadoTurnoCaja.Abierto).length,
      turnosCerrados: allTurnos.filter((t) => t.estado === EstadoTurnoCaja.Cerrado).length,
    };
  }, [allTurnos, totalItems]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusTabChange = (tab: "TODOS" | "ABIERTOS" | "CERRADOS") => {
    setSelectedStatusTab(tab);
    setCurrentPage(1);
  };

  const handleCajaFilterChange = (cajaId: string) => {
    setSelectedCajaFilter(cajaId);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Handlers de Turno
  const handleOpenCreateModal = () => {
    setTurnoToEdit(null);
    setFormMode("create");
    setFormDialogOpen(true);
  };

  const handleEdit = (turno: TurnoCajaResponse) => {
    setTurnoToEdit(turno);
    setFormMode("edit");
    setFormDialogOpen(true);
  };

  const handleCloseTurno = (turno: TurnoCajaResponse) => {
    setTurnoToEdit(turno);
    setFormMode("close");
    setFormDialogOpen(true);
  };

  const handlePromptDelete = (turno: TurnoCajaResponse) => {
    setTurnoToDelete(turno);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!turnoToDelete) return;
    try {
      await deleteMutation.mutateAsync(turnoToDelete.id);
      toast.success(`Registro de turno eliminado correctamente.`);
      setDeleteDialogOpen(false);
      setTurnoToDelete(null);
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(err.response?.data?.detail || err.message || "Error al eliminar el turno.");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <TurnoCajaHeader onNewTurnoClick={handleOpenCreateModal} />

      {/* Métricas Resumen Interactivas */}
      <TurnoCajaMetrics
        metrics={metrics}
        isLoading={isLoading}
        activeStatusTab={selectedStatusTab}
        onSelectStatusTab={handleStatusTabChange}
      />

      {/* Listado Principal de Turnos en Formato Tarjetas */}
      <TurnoCajaList
        turnos={filteredTurnos}
        cajas={cajasList}
        counts={{
          total: metrics.totalTurnos,
          abiertos: metrics.turnosAbiertos,
          cerrados: metrics.turnosCerrados,
        }}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedStatusTab={selectedStatusTab}
        selectedCajaFilter={selectedCajaFilter}
        onStatusTabChange={handleStatusTabChange}
        onCajaFilterChange={handleCajaFilterChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleEdit}
        onCloseTurno={handleCloseTurno}
        onDelete={handlePromptDelete}
        onNewTurnoClick={handleOpenCreateModal}
        onRefresh={() => refetch()}
      />

      {/* Dialog para Crear / Editar / Cerrar Turno */}
      <TurnoCajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        turnoToEdit={turnoToEdit}
        mode={formMode}
        defaultCajaId={selectedCajaFilter !== "ALL" ? Number(selectedCajaFilter) : undefined}
        onSuccessCallback={() => {
          refetch();
        }}
      />

      {/* Dialog de Confirmación de Eliminación */}
      <TurnoCajaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        turno={turnoToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
