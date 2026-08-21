"use client";

import * as React from "react";
import { toast } from "sonner";
import { MetodoPagoHeader } from "./metodo-pago-header";
import { MetodoPagoMetricsCards } from "./metodo-pago-metrics";
import { MetodoPagoTable } from "./metodo-pago-table";
import { MetodoPagoFormDialog } from "./metodo-pago-form-dialog";
import { MetodoPagoDeleteDialog } from "./metodo-pago-delete-dialog";
import {
  useDeleteMetodoPago,
  useMetodosPago,
} from "../hooks/use-metodos-pago";
import type {
  MetodoPagoMetrics as MetodoPagoMetricsType,
  MetodoPagoResponse,
} from "../types/metodo-pago.types";

export function MetodoPagoModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [metodoToEdit, setMetodoToEdit] =
    React.useState<MetodoPagoResponse | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [metodoToDelete, setMetodoToDelete] =
    React.useState<MetodoPagoResponse | null>(null);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useMetodosPago({
    page: currentPage,
    pageSize,
    search: searchTerm.trim() || undefined,
  });

  const deleteMutation = useDeleteMetodoPago();

  const metodos = React.useMemo(() => {
    return apiData?.items ?? [];
  }, [apiData]);

  // Cálculo de Métricas
  const metrics: MetodoPagoMetricsType = React.useMemo(() => {
    const total = apiData?.totalItems ?? metodos.length;
    const activos = metodos.filter((m) => m.activo).length;
    const inactivos = metodos.filter((m) => !m.activo).length;
    const requierenReferencia = metodos.filter((m) => m.requiereReferencia).length;

    return {
      totalMetodos: total,
      activos,
      inactivos,
      requierenReferencia,
    };
  }, [apiData, metodos]);

  const handleOpenAdd = () => {
    setMetodoToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (metodo: MetodoPagoResponse) => {
    setMetodoToEdit(metodo);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (metodo: MetodoPagoResponse) => {
    setMetodoToDelete(metodo);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!metodoToDelete) return;
    try {
      await deleteMutation.mutateAsync(metodoToDelete.id);
      toast.success(`Método de pago "${metodoToDelete.nombre}" dado de baja.`);
      refetch();
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo eliminar el método de pago.";
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in-50 duration-300">
      <MetodoPagoHeader onAddClick={handleOpenAdd} />
      <MetodoPagoMetricsCards metrics={metrics} isLoading={isLoading} />
      <MetodoPagoTable
        metodos={metodos}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? metodos.length}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <MetodoPagoFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        metodoToEdit={metodoToEdit}
        onSuccess={() => refetch()}
      />

      <MetodoPagoDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        metodo={metodoToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
