"use client";

import * as React from "react";
import { toast } from "sonner";
import { useDeleteTurnoCaja, useTurnosCaja } from "../hooks/use-turnos-caja";
import { TurnoCajaHeader } from "./turno-caja-header";
import { TurnoCajaMetrics } from "./turno-caja-metrics";
import { TurnoCajaList, type TurnoCajaEstadoFiltro } from "./turno-caja-list";
import { TurnoCajaFormDialog } from "./turno-caja-form-dialog";
import { TurnoCajaDeleteDialog } from "./turno-caja-delete-dialog";
import { EstadoTurnoCaja, type TurnoCajaResponse } from "../types/turno-caja.types";

export function TurnoCajaModuleView() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedEstadoTab, setSelectedEstadoTab] = React.useState<TurnoCajaEstadoFiltro>("TODOS");

  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit" | "close">("create");
  const [turnoSelected, setTurnoSelected] = React.useState<TurnoCajaResponse | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [turnoToDelete, setTurnoToDelete] = React.useState<TurnoCajaResponse | null>(null);

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
  } = useTurnosCaja({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteTurnoCaja();

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

  const metrics = React.useMemo(() => {
    return {
      totalTurnos: totalItems,
      turnosAbiertos: turnos.filter((t) => t.estado === EstadoTurnoCaja.Abierto).length,
      turnosCerrados: turnos.filter((t) => t.estado === EstadoTurnoCaja.Cerrado).length,
    };
  }, [turnos, totalItems]);

  const handleOpenCreateModal = () => {
    setTurnoSelected(null);
    setDialogMode("create");
    setFormDialogOpen(true);
  };

  const handleEdit = (turno: TurnoCajaResponse) => {
    setTurnoSelected(turno);
    setDialogMode("edit");
    setFormDialogOpen(true);
  };

  const handleCloseTurno = (turno: TurnoCajaResponse) => {
    setTurnoSelected(turno);
    setDialogMode("close");
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
      toast.success(`Turno de caja eliminado correctamente.`);
      setDeleteDialogOpen(false);
      setTurnoToDelete(null);
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(err.response?.data?.detail || err.message || "Error al eliminar el turno.");
    }
  };

  const handleEstadoTabChange = (tab: TurnoCajaEstadoFiltro) => {
    setSelectedEstadoTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      <TurnoCajaHeader onOpenTurnoClick={handleOpenCreateModal} />

      <TurnoCajaMetrics metrics={metrics} isLoading={isLoading} />

      <TurnoCajaList
        turnos={filteredTurnos}
        isLoading={isLoading}
        totalItems={selectedEstadoTab === "TODOS" ? totalItems : filteredTurnos.length}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedEstadoTab={selectedEstadoTab}
        onEstadoTabChange={handleEstadoTabChange}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onEdit={handleEdit}
        onCloseTurno={handleCloseTurno}
        onDelete={handlePromptDelete}
        onRefresh={() => refetch()}
      />

      <TurnoCajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        turnoToEdit={turnoSelected}
        mode={dialogMode}
        onSuccessCallback={() => refetch()}
      />

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
