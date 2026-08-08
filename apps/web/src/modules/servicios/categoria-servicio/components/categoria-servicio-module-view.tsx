"use client";

import * as React from "react";
import { CategoriaServicioHeader } from "./categoria-servicio-header";
import { CategoriaServicioMetricsCards } from "./categoria-servicio-metrics";
import { CategoriaServicioTable } from "./categoria-servicio-table";
import { CategoriaServicioFormDialog } from "./categoria-servicio-form-dialog";
import { CategoriaServicioDeleteDialog } from "./categoria-servicio-delete-dialog";
import { useCategoriasServicio } from "../hooks/use-categoria-servicio";
import type { CategoriaServicioMetrics, CategoriaServicioResponse } from "../types/categoria-servicio.types";

export function CategoriaServicioModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = React.useState<CategoriaServicioResponse | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = React.useState<CategoriaServicioResponse | null>(null);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useCategoriasServicio({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const categorias = React.useMemo(() => {
    return apiData?.items ?? [];
  }, [apiData]);

  const metrics: CategoriaServicioMetrics = React.useMemo(() => {
    const rawItems = apiData?.items ?? [];
    const conDesc = rawItems.filter((c) => Boolean(c.descripcion?.trim())).length;

    return {
      totalCategorias: apiData?.totalItems ?? rawItems.length,
      conServiciosCount: rawItems.length,
      conDescripcionCount: conDesc,
    };
  }, [apiData]);

  const handleOpenAdd = () => {
    setCategoriaToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (cat: CategoriaServicioResponse) => {
    setCategoriaToEdit(cat);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (cat: CategoriaServicioResponse) => {
    setCategoriaToDelete(cat);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <CategoriaServicioHeader onAddClick={handleOpenAdd} />
      <CategoriaServicioMetricsCards metrics={metrics} />
      <CategoriaServicioTable
        categorias={categorias}
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
      <CategoriaServicioFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        categoriaToEdit={categoriaToEdit}
        onSuccessCallback={() => refetch()}
      />
      <CategoriaServicioDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categoriaToDelete={categoriaToDelete}
        onSuccessCallback={() => refetch()}
      />
    </div>
  );
}
