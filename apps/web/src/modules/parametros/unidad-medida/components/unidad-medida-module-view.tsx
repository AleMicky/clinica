"use client";

import * as React from "react";
import { toast } from "sonner";
import { UnidadMedidaHeader } from "./unidad-medida-header";
import { UnidadMedidaMetricsCards } from "./unidad-medida-metrics";
import { UnidadMedidaTable, type UnidadMedidaItem } from "./unidad-medida-table";
import { UnidadMedidaFormDialog } from "./unidad-medida-form-dialog";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useUnidadesMedida, useDeleteUnidadMedida } from "../hooks/use-unidades-medida";
import type { UnidadMedidaMetrics, UnidadMedidaResponse } from "../types/unidad-medida.types";

export function UnidadMedidaModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [unidadToEdit, setUnidadToEdit] = React.useState<
    UnidadMedidaResponse | UnidadMedidaItem | null
  >(null);

  // State for Delete AlertDialog confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [unidadToDelete, setUnidadToDelete] = React.useState<UnidadMedidaItem | null>(null);

  // State for server-side pagination, search & filters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoriaFilter, setCategoriaFilter] = React.useState("Todos");

  // React Query Hook: Requests real API endpoint `/unidades-medida`
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useUnidadesMedida({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const deleteUnidadMutation = useDeleteUnidadMedida();

  // Reset pagination when searching or changing page size/category filter
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleCategoriaFilterChange = (cat: string) => {
    setCategoriaFilter(cat);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Maps backend API response directly to table items & applies category filter
  const unidades: UnidadMedidaItem[] = React.useMemo(() => {
    if (!apiData?.items) return [];
    
    const mapped = apiData.items.map((item) => ({
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      simbolo: item.simbolo,
      categoria: item.categoria,
      activo: item.activo ?? true,
    }));

    if (categoriaFilter === "Todos") {
      return mapped;
    }

    return mapped.filter((item) =>
      item.categoria.toLowerCase().includes(categoriaFilter.toLowerCase())
    );
  }, [apiData, categoriaFilter]);

  // Compute Metrics from API data
  const metrics: UnidadMedidaMetrics = React.useMemo(() => {
    const rawItems = apiData?.items ?? [];
    const dosificacion = rawItems.filter(
      (u) => u.categoria.toLowerCase() === "dosificación" || u.categoria.toLowerCase() === "dosificacion"
    ).length;
    const volumenPeso = rawItems.filter((u) => {
      const cat = u.categoria.toLowerCase();
      return cat === "volumen" || cat === "peso";
    }).length;

    const uniqueCategories = new Set(rawItems.map((u) => u.categoria.trim()).filter(Boolean));

    return {
      totalUnidades: apiData?.totalItems ?? rawItems.length,
      dosificacionCount: dosificacion,
      volumenPesoCount: volumenPeso,
      categoriasCount: uniqueCategories.size || 4,
    };
  }, [apiData]);

  const handleOpenAdd = () => {
    setUnidadToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (unidad: UnidadMedidaItem) => {
    setUnidadToEdit(unidad);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (unidad: UnidadMedidaItem) => {
    setUnidadToDelete(unidad);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!unidadToDelete) return;
    const numId = Number(unidadToDelete.id);

    try {
      await deleteUnidadMutation.mutateAsync(numId);
      toast.success(`Unidad de medida ${unidadToDelete.codigo} eliminada correctamente.`);
      refetch();
    } catch {
    } finally {
      setUnidadToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <UnidadMedidaHeader onAddClick={handleOpenAdd} />
      <UnidadMedidaMetricsCards metrics={metrics} />
      <UnidadMedidaTable
        unidades={unidades}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        categoriaFilter={categoriaFilter}
        onSearchChange={handleSearchChange}
        onCategoriaFilterChange={handleCategoriaFilterChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />
      <UnidadMedidaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        unidadToEdit={unidadToEdit}
        onSuccessCallback={() => refetch()}
      />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar la unidad de medida?"
        itemName={unidadToDelete ? `${unidadToDelete.nombre} (${unidadToDelete.codigo})` : undefined}
        confirmLabel="Eliminar Unidad"
        onConfirm={handleConfirmDelete}
        isLoading={deleteUnidadMutation.isPending}
      />
    </div>
  );
}
