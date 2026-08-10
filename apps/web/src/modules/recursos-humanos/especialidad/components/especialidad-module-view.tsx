"use client";

import * as React from "react";
import { toast } from "sonner";
import { EspecialidadHeader } from "./especialidad-header";
import { EspecialidadMetricsCards } from "./especialidad-metrics";
import { EspecialidadTable, type EspecialidadItem } from "./especialidad-table";
import { EspecialidadFormDialog } from "./especialidad-form-dialog";
import { EspecialidadDeleteDialog } from "./especialidad-delete-dialog";
import {
  useEspecialidades,
  useDeleteEspecialidad,
} from "../hooks/use-especialidades";
import type {
  EspecialidadMetrics as EspecialidadMetricsType,
  EspecialidadResponse,
} from "../types/especialidad.types";

export function EspecialidadModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [especialidadToEdit, setEspecialidadToEdit] = React.useState<
    EspecialidadResponse | EspecialidadItem | null
  >(null);

  // Delete Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [especialidadToDelete, setEspecialidadToDelete] =
    React.useState<EspecialidadItem | null>(null);

  // Pagination & Search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Query Hook
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useEspecialidades({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const deleteMutation = useDeleteEspecialidad();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Map API items to EspecialidadItem
  const especialidades: EspecialidadItem[] = React.useMemo(() => {
    if (!apiData?.items) return [];
    return apiData.items.map((item) => ({
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion,
      activo: item.activo,
    }));
  }, [apiData]);

  // Compute Metrics
  const metrics: EspecialidadMetricsType = {
    totalEspecialidades: apiData?.totalItems ?? especialidades.length,
    especialidadesActivas: especialidades.filter((e) => e.activo).length,
    especialidadesInactivas: especialidades.filter((e) => !e.activo).length,
  };

  const handleOpenAdd = () => {
    setEspecialidadToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (esp: EspecialidadItem) => {
    setEspecialidadToEdit(esp);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    const target = especialidades.find((e) => e.id === id);
    if (target) {
      setEspecialidadToDelete(target);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!especialidadToDelete) return;

    try {
      await deleteMutation.mutateAsync(especialidadToDelete.id);
      toast.success(
        `Especialidad "${especialidadToDelete.nombre}" eliminada correctamente.`
      );
      refetch();
    } catch {
      // Error handled by query client / toast interceptor
    } finally {
      setEspecialidadToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <EspecialidadHeader onAddClick={handleOpenAdd} />
      <EspecialidadMetricsCards metrics={metrics} />
      <EspecialidadTable
        especialidades={especialidades}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />
      <EspecialidadFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        especialidadToEdit={especialidadToEdit}
        onSuccessCallback={() => refetch()}
      />
      <EspecialidadDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        especialidad={especialidadToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
