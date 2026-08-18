"use client";

import * as React from "react";
import { toast } from "sonner";
import { useCajas, useDeleteCaja } from "../hooks/use-cajas";
import { CajaHeader } from "./caja-header";
import { CajaMetrics } from "./caja-metrics";
import { CajaList, type CajaEstadoFiltro } from "./caja-list";
import { CajaFormDialog } from "./caja-form-dialog";
import { CajaDeleteDialog } from "./caja-delete-dialog";
import type { CajaResponse } from "../types/caja.types";

export function CajaModuleView() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedEstadoTab, setSelectedEstadoTab] = React.useState<CajaEstadoFiltro>("TODOS");

  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [cajaToEdit, setCajaToEdit] = React.useState<CajaResponse | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [cajaToDelete, setCajaToDelete] = React.useState<CajaResponse | null>(null);

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
  } = useCajas({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteCaja();

  const cajas = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
    ? (apiData as unknown as CajaResponse[])
    : [];
  const totalItems = apiData?.totalItems ?? cajas.length;

  const filteredCajas = React.useMemo(() => {
    if (selectedEstadoTab === "ACTIVAS") {
      return cajas.filter((c) => c.activo);
    }
    if (selectedEstadoTab === "INACTIVAS") {
      return cajas.filter((c) => !c.activo);
    }
    return cajas;
  }, [cajas, selectedEstadoTab]);

  const metrics = React.useMemo(() => {
    return {
      totalCajas: totalItems,
      cajasActivas: cajas.filter((c) => c.activo).length,
      cajasInactivas: cajas.filter((c) => !c.activo).length,
    };
  }, [cajas, totalItems]);

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

  const handleEstadoTabChange = (tab: CajaEstadoFiltro) => {
    setSelectedEstadoTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      <CajaHeader onNewCajaClick={handleOpenCreateModal} />

      <CajaMetrics metrics={metrics} isLoading={isLoading} />

      <CajaList
        cajas={filteredCajas}
        isLoading={isLoading}
        totalItems={selectedEstadoTab === "TODOS" ? totalItems : filteredCajas.length}
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
        onDelete={handlePromptDelete}
        onRefresh={() => refetch()}
      />

      <CajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        cajaToEdit={cajaToEdit}
        onSuccessCallback={() => refetch()}
      />

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
