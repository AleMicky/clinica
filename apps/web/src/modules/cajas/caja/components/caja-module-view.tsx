"use client";

import * as React from "react";
import { toast } from "sonner";
import { useCajas, useDeleteCaja } from "../hooks/use-cajas";
import { CajaHeader } from "./caja-header";
import { CajaMetrics } from "./caja-metrics";
import { CajaList } from "./caja-list";
import { CajaFormDialog } from "./caja-form-dialog";
import { CajaDeleteDialog } from "./caja-delete-dialog";
import type { CajaResponse } from "../types/caja.types";

export function CajaModuleView() {
  // Estado de Paginación y Filtros
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");

  // Dialogs de Caja
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [cajaToEdit, setCajaToEdit] = React.useState<CajaResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [cajaToDelete, setCajaToDelete] = React.useState<CajaResponse | null>(null);

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

  const allCajas: CajaResponse[] = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
      ? (apiData as unknown as CajaResponse[])
      : [];

  const totalItems = apiData?.totalItems ?? allCajas.length;

  // Filtrado local por pestaña de estado
  const filteredCajas = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allCajas.filter((c) => c.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allCajas.filter((c) => !c.activo);
    }
    return allCajas;
  }, [allCajas, selectedStatusTab]);

  const metrics = React.useMemo(() => {
    return {
      totalCajas: totalItems,
      cajasActivas: allCajas.filter((c) => c.activo).length,
      cajasInactivas: allCajas.filter((c) => !c.activo).length,
    };
  }, [allCajas, totalItems]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusTabChange = (tab: "TODOS" | "ACTIVOS" | "INACTIVOS") => {
    setSelectedStatusTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Handlers Caja
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
      setDeleteDialogOpen(false);
      setCajaToDelete(null);
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(err.response?.data?.detail || err.message || "Error al eliminar la caja.");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <CajaHeader onNewCajaClick={handleOpenCreateModal} />

      {/* Métricas Resumen */}
      <CajaMetrics metrics={metrics} isLoading={isLoading} />

      {/* Listado Principal de Cajas (Full Width) */}
      <CajaList
        cajas={filteredCajas}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedStatusTab={selectedStatusTab}
        onStatusTabChange={handleStatusTabChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleEdit}
        onDelete={handlePromptDelete}
        onRefresh={() => refetch()}
      />

      {/* Modales de Crear / Editar Caja */}
      <CajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        cajaToEdit={cajaToEdit}
        onSuccessCallback={() => {
          refetch();
        }}
      />

      {/* Modal de Confirmación de Eliminación */}
      <CajaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        caja={cajaToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
