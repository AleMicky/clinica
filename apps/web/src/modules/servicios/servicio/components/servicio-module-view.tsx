"use client";

import * as React from "react";
import { ServicioHeader } from "./servicio-header";
import { ServicioMetricsCards } from "./servicio-metrics";
import { ServicioTable } from "./servicio-table";
import { ServicioFormDialog } from "./servicio-form-dialog";
import { ServicioDeleteDialog } from "./servicio-delete-dialog";
import { useServicios } from "../hooks/use-servicio";
import { useCategoriasServicio, type CategoriaServicioResponse } from "../../categoria-servicio";
import type { ServicioItem, ServicioMetrics, ServicioResponse } from "../types/servicio.types";

export function ServicioModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [servicioToEdit, setServicioToEdit] = React.useState<ServicioItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [servicioToDelete, setServicioToDelete] = React.useState<ServicioItem | null>(null);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Fetch categories for filtering & dropdown selection
  const { data: categoriesData } = useCategoriasServicio({ pageSize: 100 });
  const categorias = React.useMemo(() => categoriesData?.items ?? [], [categoriesData]);

  const [selectedCategoriaId, setSelectedCategoriaId] = React.useState<number>(0);

  // Set default category when loaded
  React.useEffect(() => {
    if (categorias.length > 0 && selectedCategoriaId === 0) {
      setSelectedCategoriaId(categorias[0].id);
    }
  }, [categorias, selectedCategoriaId]);

  // Fetch services for selected category
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useServicios(selectedCategoriaId, {
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  }, selectedCategoriaId > 0);

  const currentCategory = React.useMemo(
    () => categorias.find((c: CategoriaServicioResponse) => c.id === selectedCategoriaId),
    [categorias, selectedCategoriaId]
  );

  const servicios: ServicioItem[] = React.useMemo(() => {
    if (!apiData?.items) return [];
    return apiData.items.map((item: ServicioResponse) => ({
      ...item,
      categoriaNombre: currentCategory?.nombre ?? "Categoría",
    }));
  }, [apiData, currentCategory]);

  const metrics: ServicioMetrics = React.useMemo(() => {
    const rawItems = apiData?.items ?? [];
    const conDesc = rawItems.filter((s: ServicioResponse) => Boolean(s.descripcion?.trim())).length;

    return {
      totalServicios: apiData?.totalItems ?? rawItems.length,
      totalCategoriasCount: categorias.length,
      conDescripcionCount: conDesc,
    };
  }, [apiData, categorias]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleCategoriaChange = (catId: number) => {
    setSelectedCategoriaId(catId);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setServicioToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (srv: ServicioItem) => {
    setServicioToEdit(srv);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (srv: ServicioItem) => {
    setServicioToDelete(srv);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <ServicioHeader onAddClick={handleOpenAdd} />
      <ServicioMetricsCards metrics={metrics} />
      <ServicioTable
        servicios={servicios}
        categorias={categorias}
        selectedCategoriaId={selectedCategoriaId}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onCategoriaChange={handleCategoriaChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />
      <ServicioFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        servicioToEdit={servicioToEdit}
        categorias={categorias}
        defaultCategoriaId={selectedCategoriaId}
        onSuccessCallback={() => refetch()}
      />
      <ServicioDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        servicioToDelete={servicioToDelete}
        onSuccessCallback={() => refetch()}
      />
    </div>
  );
}
