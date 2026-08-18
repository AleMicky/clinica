"use client";

import * as React from "react";
import { toast } from "sonner";
import { useCajas, useDeleteCaja } from "../hooks/use-cajas";
import {
  useDeleteTurnoCaja,
} from "../../turno-caja/hooks/use-turnos-caja";
import { CajaHeader } from "./caja-header";
import { CajaMetrics } from "./caja-metrics";
import { CajaList } from "./caja-list";
import { CajaTurnosPanel } from "./caja-turnos-panel";
import { CajaFormDialog } from "./caja-form-dialog";
import { CajaDeleteDialog } from "./caja-delete-dialog";
import { TurnoCajaFormDialog } from "../../turno-caja/components/turno-caja-form-dialog";
import { TurnoCajaDeleteDialog } from "../../turno-caja/components/turno-caja-delete-dialog";
import type { CajaResponse } from "../types/caja.types";
import type { TurnoCajaResponse } from "../../turno-caja/types/turno-caja.types";

export function CajaModuleView() {
  // Estado de Maestro: Puntos de Caja
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedCaja, setSelectedCaja] = React.useState<CajaResponse | null>(null);

  // Dialogs de Caja
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [cajaToEdit, setCajaToEdit] = React.useState<CajaResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [cajaToDelete, setCajaToDelete] = React.useState<CajaResponse | null>(null);

  // Dialogs de Turnos de Caja (Detalle)
  const [turnoFormOpen, setTurnoFormOpen] = React.useState(false);
  const [turnoDialogMode, setTurnoDialogMode] = React.useState<"create" | "edit" | "close">("create");
  const [turnoSelected, setTurnoSelected] = React.useState<TurnoCajaResponse | null>(null);
  const [turnoDeleteOpen, setTurnoDeleteOpen] = React.useState(false);
  const [turnoToDelete, setTurnoToDelete] = React.useState<TurnoCajaResponse | null>(null);

  // Debounce búsqueda de cajas
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
  } = useCajas({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteCaja();
  const deleteTurnoMutation = useDeleteTurnoCaja();

  const cajas = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
    ? (apiData as unknown as CajaResponse[])
    : [];
  const totalItems = apiData?.totalItems ?? cajas.length;

  // Auto-seleccionar primera caja disponible
  React.useEffect(() => {
    if (cajas.length > 0 && !selectedCaja) {
      setSelectedCaja(cajas[0]);
    } else if (selectedCaja && cajas.length > 0) {
      const updated = cajas.find((c) => c.id === selectedCaja.id);
      if (updated) setSelectedCaja(updated);
    }
  }, [cajas, selectedCaja]);

  const metrics = React.useMemo(() => {
    return {
      totalCajas: totalItems,
      cajasActivas: cajas.filter((c) => c.activo).length,
      cajasInactivas: cajas.filter((c) => !c.activo).length,
    };
  }, [cajas, totalItems]);

  // Handlers Caja (Maestro)
  const handleOpenCreateModal = () => {
    setCajaToEdit(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (caja: CajaResponse) => {
    setCajaToEdit(caja);
    setFormDialogOpen(true);
  };

  const handlePromptDelete = (caja: CajaResponse) => {
    setCajaToDelete(caja);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cajaToDelete) return;
    try {
      await deleteMutation.mutateAsync(cajaToDelete.id);
      toast.success(`Caja "${cajaToDelete.nombre}" eliminada correctamente.`);
      if (selectedCaja?.id === cajaToDelete.id) {
        setSelectedCaja(null);
      }
      setDeleteDialogOpen(false);
      setCajaToDelete(null);
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(err.response?.data?.detail || err.message || "Error al eliminar la caja.");
    }
  };

  // Handlers Turnos (Detalle)
  const handleOpenCreateTurno = (caja: CajaResponse) => {
    setSelectedCaja(caja);
    setTurnoSelected(null);
    setTurnoDialogMode("create");
    setTurnoFormOpen(true);
  };

  const handleEditTurno = (turno: TurnoCajaResponse) => {
    setTurnoSelected(turno);
    setTurnoDialogMode("edit");
    setTurnoFormOpen(true);
  };

  const handleCloseTurno = (turno: TurnoCajaResponse) => {
    setTurnoSelected(turno);
    setTurnoDialogMode("close");
    setTurnoFormOpen(true);
  };

  const handlePromptDeleteTurno = (turno: TurnoCajaResponse) => {
    setTurnoToDelete(turno);
    setTurnoDeleteOpen(true);
  };

  const handleConfirmDeleteTurno = async () => {
    if (!turnoToDelete) return;
    try {
      await deleteTurnoMutation.mutateAsync(turnoToDelete.id);
      toast.success("Turno de caja eliminado correctamente.");
      setTurnoDeleteOpen(false);
      setTurnoToDelete(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(err.response?.data?.detail || err.message || "Error al eliminar el turno.");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      <CajaHeader onNewCajaClick={handleOpenCreateModal} />

      <CajaMetrics metrics={metrics} isLoading={isLoading} />

      {/* Grid Maestro - Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Columna Izquierda: Maestro (Puntos de Caja) */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <CajaList
            cajas={cajas}
            selectedCajaId={selectedCaja?.id ?? null}
            onSelectCaja={setSelectedCaja}
            isLoading={isLoading}
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            onEdit={handleEdit}
            onDelete={handlePromptDelete}
            onRefresh={() => refetch()}
          />
        </div>

        {/* Columna Derecha: Detalle (Turnos de la Caja Seleccionada) */}
        <div className="lg:col-span-7 xl:col-span-8 h-full">
          <CajaTurnosPanel
            selectedCaja={selectedCaja}
            onOpenTurno={handleOpenCreateTurno}
            onEditTurno={handleEditTurno}
            onCloseTurno={handleCloseTurno}
            onDeleteTurno={handlePromptDeleteTurno}
          />
        </div>
      </div>

      {/* Modales de Caja */}
      <CajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        cajaToEdit={cajaToEdit}
        onSuccessCallback={(createdOrUpdated) => {
          refetch();
          if (createdOrUpdated) {
            setSelectedCaja(createdOrUpdated);
          }
        }}
      />

      <CajaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        caja={cajaToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Modales de Turnos de Caja */}
      <TurnoCajaFormDialog
        open={turnoFormOpen}
        onOpenChange={setTurnoFormOpen}
        turnoToEdit={turnoSelected}
        defaultCajaId={selectedCaja?.id}
        mode={turnoDialogMode}
      />

      <TurnoCajaDeleteDialog
        open={turnoDeleteOpen}
        onOpenChange={setTurnoDeleteOpen}
        turno={turnoToDelete}
        onConfirm={handleConfirmDeleteTurno}
        isLoading={deleteTurnoMutation.isPending}
      />
    </div>
  );
}
