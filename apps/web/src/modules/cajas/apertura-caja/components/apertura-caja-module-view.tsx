"use client";

import * as React from "react";
import { toast } from "sonner";
import { AperturaCajaHeader } from "./apertura-caja-header";
import { AperturaCajaMetrics, type AperturaMetricsData } from "./apertura-caja-metrics";
import { AperturaCajaList } from "./apertura-caja-list";
import { AperturaCajaFormDialog } from "./apertura-caja-form-dialog";
import { AperturaCajaDeleteDialog } from "./apertura-caja-delete-dialog";
import {
  useAperturasCaja,
  useDeleteAperturaCaja,
} from "../hooks/use-aperturas-caja";
import type { AperturaCajaResponse } from "../types/apertura-caja.types";

export function AperturaCajaModuleView() {
  // Paginación y Filtros
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<"TODOS" | "HOY">("TODOS");

  // Dialogs
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [aperturaToEdit, setAperturaToEdit] = React.useState<AperturaCajaResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [aperturaToDelete, setAperturaToDelete] = React.useState<AperturaCajaResponse | null>(null);

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
  } = useAperturasCaja({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteAperturaCaja();

  const allAperturas: AperturaCajaResponse[] = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
    ? (apiData as unknown as AperturaCajaResponse[])
    : [];

  const totalItems = apiData?.totalItems ?? allAperturas.length;

  // Filtrado local por fecha de hoy si aplica
  const filteredAperturas = React.useMemo(() => {
    if (selectedFilter === "HOY") {
      const todayIso = new Date().toISOString().slice(0, 10);
      return allAperturas.filter((a) => a.fechaHora && a.fechaHora.startsWith(todayIso));
    }
    return allAperturas;
  }, [allAperturas, selectedFilter]);

  // Cálculo de Métricas
  const metrics: AperturaMetricsData = React.useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const aperturasHoy = allAperturas.filter(
      (a) => a.fechaHora && a.fechaHora.startsWith(todayIso)
    ).length;

    const montoTotalInicial = allAperturas.reduce(
      (acc, curr) => acc + (Number(curr.montoInicial) || 0),
      0
    );

    const promedioInicial =
      allAperturas.length > 0 ? montoTotalInicial / allAperturas.length : 0;

    return {
      totalAperturas: totalItems,
      montoTotalInicial,
      aperturasHoy,
      promedioInicial,
    };
  }, [allAperturas, totalItems]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filter: "TODOS" | "HOY") => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setAperturaToEdit(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (apertura: AperturaCajaResponse) => {
    setAperturaToEdit(apertura);
    setFormDialogOpen(true);
  };

  const handleDelete = (apertura: AperturaCajaResponse) => {
    setAperturaToDelete(apertura);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!aperturaToDelete) return;
    try {
      await deleteMutation.mutateAsync(aperturaToDelete.id);
      toast.success("Apertura de caja eliminada correctamente.");
      setDeleteDialogOpen(false);
      setAperturaToDelete(null);
      refetch();
    } catch {
      toast.error("Ocurrió un error al eliminar la apertura de caja.");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera */}
      <AperturaCajaHeader onAddClick={handleOpenAdd} onRefresh={() => refetch()} />

      {/* Métricas Interactivas */}
      <AperturaCajaMetrics
        metrics={metrics}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Listado en Formato Tarjetas */}
      <AperturaCajaList
        aperturas={filteredAperturas}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal: Registrar / Editar Apertura */}
      <AperturaCajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        aperturaToEdit={aperturaToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Modal: Confirmar Eliminación */}
      <AperturaCajaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        apertura={aperturaToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
