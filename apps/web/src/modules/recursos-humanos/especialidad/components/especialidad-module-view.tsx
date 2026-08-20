"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EspecialidadHeader } from "./especialidad-header";
import { EspecialidadMetricsCards } from "./especialidad-metrics";
import { EspecialidadList } from "./especialidad-list";
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
  const router = useRouter();

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

  const allEspecialidades: EspecialidadResponse[] = apiData?.items ?? [];

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
    router.push("/recursos-humanos/especialidades/nueva");
  };

  const handleOpenEdit = (especialidad: EspecialidadResponse) => {
    router.push(`/recursos-humanos/especialidades/${especialidad.id}/editar`);
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

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <EspecialidadHeader onAddClick={handleOpenAdd} onRefresh={() => refetch()} />

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
