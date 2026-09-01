"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TipoAreaHeader } from "./tipo-area-header";
import {
  TipoAreaMetricsCards,
  type TipoAreaMetrics,
} from "./tipo-area-metrics";
import { TipoAreaList } from "./tipo-area-list";
import { ConfirmDeleteDialog } from "@/components/shared";
import {
  useDeleteTipoArea,
  useTiposArea,
} from "../hooks/use-tipos-area";
import type { TipoAreaResponse } from "../types/tipo-area.types";

export function TipoAreaModuleView() {
  const router = useRouter();

  // State for Delete AlertDialog confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [tipoAreaToDelete, setTipoAreaToDelete] =
    React.useState<TipoAreaResponse | null>(null);

  // State for server-side pagination, search & filters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");

  // React Query Hook
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useTiposArea({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const deleteMutation = useDeleteTipoArea();

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

  const allTiposArea: TipoAreaResponse[] = apiData?.items ?? [];

  // Filter by status tab
  const filteredTiposArea = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allTiposArea.filter((t) => t.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allTiposArea.filter((t) => !t.activo);
    }
    return allTiposArea;
  }, [allTiposArea, selectedStatusTab]);

  // Compute Metrics
  const total = apiData?.totalItems ?? allTiposArea.length;
  const activos = allTiposArea.filter((t) => t.activo).length;
  const inactivos = allTiposArea.filter((t) => !t.activo).length;

  const metrics: TipoAreaMetrics = {
    total,
    activos,
    inactivos,
  };

  const handleOpenAdd = () => {
    router.push("/recursos-humanos/tipos-area/nuevo");
  };

  const handleOpenEdit = (tipoArea: TipoAreaResponse) => {
    router.push(`/recursos-humanos/tipos-area/${tipoArea.id}/editar`);
  };

  const handleOpenDelete = (tipoArea: TipoAreaResponse) => {
    setTipoAreaToDelete(tipoArea);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tipoAreaToDelete) return;

    try {
      await deleteMutation.mutateAsync(tipoAreaToDelete.id);
      toast.success(
        `Tipo de área "${tipoAreaToDelete.nombre}" eliminado correctamente.`
      );
      refetch();
    } catch {
      toast.error("Ocurrió un error al eliminar el tipo de área.");
    } finally {
      setTipoAreaToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <TipoAreaHeader onAddClick={handleOpenAdd} onRefresh={() => refetch()} />

      {/* Tarjetas de Métricas en Vivo */}
      <TipoAreaMetricsCards metrics={metrics} />

      {/* Listado Principal de Tipos de Área */}
      <TipoAreaList
        tiposArea={filteredTiposArea}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? allTiposArea.length}
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
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar el tipo de área seleccionado?"
        itemName={tipoAreaToDelete ? `${tipoAreaToDelete.nombre} (${tipoAreaToDelete.codigo})` : undefined}
        confirmLabel="Eliminar Tipo de Área"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}