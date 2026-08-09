"use client";

import * as React from "react";
import { toast } from "sonner";
import { TipoAreaHeader } from "./tipo-area-header";
import {
  TipoAreaMetricsCards,
  type TipoAreaMetrics,
} from "./tipo-area-metrics";
import { TipoAreaTable, type TipoAreaItem } from "./tipo-area-table";
import { TipoAreaFormDialog } from "./tipo-area-form-dialog";
import { TipoAreaDeleteDialog } from "./tipo-area-delete-dialog";
import {
  useDeleteTipoArea,
  useTiposArea,
} from "../hooks/use-tipos-area";
import type { TipoAreaResponse } from "../types/tipo-area.types";

export function TipoAreaModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [tipoAreaToEdit, setTipoAreaToEdit] = React.useState<
    TipoAreaResponse | TipoAreaItem | null
  >(null);

  // State for Delete AlertDialog confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [tipoAreaToDelete, setTipoAreaToDelete] = React.useState<TipoAreaItem | null>(null);

  // State for server-side pagination, search & filters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [estadoFilter, setEstadoFilter] = React.useState("Todos");

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

  const deleteTipoAreaMutation = useDeleteTipoArea();

  // Reset pagination when searching or changing filters
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleEstadoFilterChange = (estado: string) => {
    setEstadoFilter(estado);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Maps backend API response directly to table items & applies status filter
  const tiposArea: TipoAreaItem[] = React.useMemo(() => {
    if (!apiData?.items) return [];

    const mapped = apiData.items.map((item) => ({
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion,
      orden: item.orden,
      activo: item.activo ?? true,
    }));

    if (estadoFilter === "Activos") {
      return mapped.filter((t) => t.activo);
    }
    if (estadoFilter === "Inactivos") {
      return mapped.filter((t) => !t.activo);
    }

    return mapped;
  }, [apiData, estadoFilter]);

  const ordenMax = React.useMemo(() => {
    const rawItems = apiData?.items ?? [];
    return rawItems.reduce((max, t) => (t.orden > max ? t.orden : max), 0);
  }, [apiData]);

  // Compute Metrics from API data
  const metrics: TipoAreaMetrics = React.useMemo(() => {
    const rawItems = apiData?.items ?? [];
    return {
      total: apiData?.totalItems ?? rawItems.length,
      activos: rawItems.filter((t) => t.activo ?? true).length,
      inactivos: rawItems.filter((t) => !t.activo).length,
      ordenMax,
    };
  }, [apiData, ordenMax]);

  const handleOpenAdd = () => {
    setTipoAreaToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (tipoArea: TipoAreaItem) => {
    setTipoAreaToEdit(tipoArea);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (id: number | string) => {
    const target = tiposArea.find((t) => t.id === id || t.id === Number(id));
    if (target) {
      setTipoAreaToDelete(target);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!tipoAreaToDelete) return;
    const numId = Number(tipoAreaToDelete.id);

    try {
      await deleteTipoAreaMutation.mutateAsync(numId);
      toast.success(
        `Tipo de área ${tipoAreaToDelete.codigo} eliminado correctamente.`
      );
      refetch();
    } catch {
    } finally {
      setTipoAreaToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <TipoAreaHeader onAddClick={handleOpenAdd} />
      <TipoAreaMetricsCards metrics={metrics} />
      <TipoAreaTable
        tiposArea={tiposArea}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        estadoFilter={estadoFilter}
        onSearchChange={handleSearchChange}
        onEstadoFilterChange={handleEstadoFilterChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />
      <TipoAreaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        tipoAreaToEdit={tipoAreaToEdit}
        onSuccessCallback={() => refetch()}
      />
      <TipoAreaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tipoArea={tipoAreaToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteTipoAreaMutation.isPending}
      />
    </div>
  );
}