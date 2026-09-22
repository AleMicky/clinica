"use client";

import * as React from "react";
import { toast } from "sonner";
import { EspecialidadHeader } from "./especialidad-header";
import { EspecialidadMetricsCards } from "./especialidad-metrics";
import { EspecialidadList } from "./especialidad-list";
import { EspecialidadFormDialog } from "./especialidad-form-dialog";
import { EspecialidadImportDialog } from "./especialidad-import-dialog";
import { EspecialidadDeleteDialog } from "./especialidad-delete-dialog";
import {
  useEspecialidades,
  useDeleteEspecialidad,
  useExportarEspecialidadesExcel,
} from "../hooks/use-especialidades";
import type {
  EspecialidadMetrics as EspecialidadMetricsType,
  EspecialidadResponse,
} from "../types/especialidad.types";

export function EspecialidadModuleView() {
  // Form Dialog state (Crear / Editar en Modal)
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [especialidadToEdit, setEspecialidadToEdit] =
    React.useState<EspecialidadResponse | null>(null);

  // Import Dialog state
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  // Delete Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [especialidadToDelete, setEspecialidadToDelete] =
    React.useState<EspecialidadResponse | null>(null);

  // Pagination & Search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");

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
  const exportMutation = useExportarEspecialidadesExcel();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusTabChange = (tab: "TODOS" | "ACTIVOS" | "INACTIVOS") => {
    setSelectedStatusTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const allEspecialidades = React.useMemo<EspecialidadResponse[]>(
    () => apiData?.items ?? [],
    [apiData?.items]
  );

  // Filter by status tab
  const filteredEspecialidades = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allEspecialidades.filter((e) => e.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allEspecialidades.filter((e) => !e.activo);
    }
    return allEspecialidades;
  }, [allEspecialidades, selectedStatusTab]);

  // Calculate metrics
  const total = apiData?.totalItems ?? allEspecialidades.length;
  const activos = allEspecialidades.filter((e) => e.activo).length;
  const inactivos = allEspecialidades.filter((e) => !e.activo).length;

  const metrics: EspecialidadMetricsType = {
    totalEspecialidades: total,
    especialidadesActivas: activos,
    especialidadesInactivas: inactivos,
  };

  const handleOpenAdd = () => {
    setEspecialidadToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (especialidad: EspecialidadResponse) => {
    setEspecialidadToEdit(especialidad);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (especialidad: EspecialidadResponse) => {
    setEspecialidadToDelete(especialidad);
    setDeleteDialogOpen(true);
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
      toast.error("Ocurrió un error al eliminar la especialidad.");
    } finally {
      setEspecialidadToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Exportar listado de especialidades a Excel
  const handleExportExcel = async () => {
    try {
      const blob = await exportMutation.mutateAsync(searchTerm.trim() || undefined);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
      link.setAttribute("download", `reporte_especialidades_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Catálogo de especialidades exportado a Excel (.xlsx) correctamente.");
    } catch {
      toast.error("Ocurrió un error al exportar el catálogo de especialidades a Excel.");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <EspecialidadHeader
        onAddClick={handleOpenAdd}
        onRefresh={() => refetch()}
        onImportClick={() => setImportDialogOpen(true)}
        onExportClick={handleExportExcel}
        isExporting={exportMutation.isPending}
      />

      {/* Tarjetas de Métricas en Vivo */}
      <EspecialidadMetricsCards metrics={metrics} />

      {/* Listado Principal de Especialidades */}
      <EspecialidadList
        especialidades={filteredEspecialidades}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? allEspecialidades.length}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedStatusTab={selectedStatusTab}
        onStatusTabChange={handleStatusTabChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />

      {/* Modal: Crear / Editar Especialidad */}
      <EspecialidadFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        especialidadToEdit={especialidadToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Modal: Importación Masiva desde Excel */}
      <EspecialidadImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* Modal: Confirmación de Eliminación */}
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
