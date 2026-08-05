"use client";

import * as React from "react";
import { toast } from "sonner";
import { MonedaHeader } from "./moneda-header";
import { MonedaMetricsCards } from "./moneda-metrics";
import { MonedaTable, type MonedaItem } from "./moneda-table";
import { MonedaFormDialog } from "./moneda-form-dialog";
import { MonedaDeleteDialog } from "./moneda-delete-dialog";
import {
  useMonedas,
  useUpdateMoneda,
  useDeleteMoneda,
} from "../hooks/use-monedas";
import type {
  MonedaMetrics as MonedaMetricsType,
  MonedaResponse,
} from "../types/moneda.types";

export function MonedaModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [monedaToEdit, setMonedaToEdit] = React.useState<
    MonedaResponse | MonedaItem | null
  >(null);

  // State for Delete AlertDialog confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [monedaToDelete, setMonedaToDelete] = React.useState<MonedaItem | null>(null);

  // State for server-side pagination & search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  // React Query Hook: Requests real API endpoint `/monedas`
  const {
    data: apiData,
    isLoading,
    isError,
    error,
    refetch,
  } = useMonedas({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const updateMonedaMutation = useUpdateMoneda();
  const deleteMonedaMutation = useDeleteMoneda();

  // Reset pagination when searching or changing page size
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Maps backend API response directly to table items
  const monedas: MonedaItem[] = React.useMemo(() => {
    if (!apiData?.items) return [];
    return apiData.items.map((item) => ({
      id: item.id,
      codigo: item.codigo,
      simbolo: item.simbolo,
      nombre: item.nombre,
      decimales: item.decimales,
      esBase: item.esBase,
      activo: item.activo,
    }));
  }, [apiData]);

  // Compute Metrics from API data
  const baseMoneda = monedas.find((m) => m.esBase);
  const metrics: MonedaMetricsType = {
    monedaBase: baseMoneda
      ? `${baseMoneda.codigo} (${baseMoneda.simbolo})`
      : apiData?.items && apiData.items.length > 0
      ? "Sin Moneda Base"
      : "USD ($)",
    monedasHabilitadas: monedas.filter((m) => m.activo).length,
    facturacionMultimoneda: true,
    monedasInactivas: monedas.filter((m) => !m.activo).length,
  };

  const handleOpenAdd = () => {
    setMonedaToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (moneda: MonedaItem) => {
    setMonedaToEdit(moneda);
    setFormDialogOpen(true);
  };

  const handleSetMonedaBase = async (id: number | string) => {
    const numId = Number(id);
    const target = monedas.find((m) => m.id === id || m.id === numId);
    if (!target) return;

    try {
      await updateMonedaMutation.mutateAsync({
        id: numId,
        data: {
          codigo: target.codigo,
          nombre: target.nombre,
          simbolo: target.simbolo,
          decimales: target.decimales,
          esBase: true,
        },
      });
      toast.success(`Moneda ${target.codigo} establecida como Moneda Base.`);
      refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error al actualizar la moneda base."
      );
    }
  };

  // Triggers AlertDialog for inactivating moneda
  const handleOpenDelete = (id: number | string) => {
    const target = monedas.find((m) => m.id === id || m.id === Number(id));
    if (target) {
      setMonedaToDelete(target);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!monedaToDelete) return;
    const numId = Number(monedaToDelete.id);

    try {
      await deleteMonedaMutation.mutateAsync(numId);
      toast.success(`Moneda ${monedaToDelete.codigo} eliminada correctamente.`);
      refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error al eliminar la moneda."
      );
    } finally {
      setMonedaToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <MonedaHeader onAddClick={handleOpenAdd} />
      <MonedaMetricsCards metrics={metrics} />
      <MonedaTable
        monedas={monedas}
        isLoading={isLoading}
        isError={isError}
        errorMessage={(error as any)?.message}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onSetMonedaBase={handleSetMonedaBase}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />
      <MonedaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        monedaToEdit={monedaToEdit}
        onSuccessCallback={() => refetch()}
      />
      <MonedaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        moneda={monedaToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMonedaMutation.isPending}
      />
    </div>
  );
}
