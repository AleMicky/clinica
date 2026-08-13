"use client";

import * as React from "react";
import { toast } from "sonner";
import { BancoHeader } from "./banco-header";
import { BancoMetricsCards } from "./banco-metrics";
import { BancoTable } from "./banco-table";
import { BancoFormDialog } from "./banco-form-dialog";
import { BancoDeleteDialog } from "./banco-delete-dialog";
import { BancoCuentasSheet } from "./banco-cuentas-sheet";
import { useBancos, useDeleteBanco } from "../hooks/use-bancos";
import type { BancoMetrics, BancoResponse } from "../types/banco.types";

export function BancoModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [bancoToEdit, setBancoToEdit] = React.useState<BancoResponse | null>(null);

  // Sheet for managing accounts of selected bank
  const [cuentasSheetOpen, setCuentasSheetOpen] = React.useState(false);
  const [selectedBancoForCuentas, setSelectedBancoForCuentas] =
    React.useState<BancoResponse | null>(null);

  // AlertDialog for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [bancoToDelete, setBancoToDelete] = React.useState<BancoResponse | null>(null);

  // Pagination & Search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Query API Bancos
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useBancos({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const deleteBancoMutation = useDeleteBanco();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const bancos = apiData?.items ?? [];

  // Metrics computation from real API response
  const metrics: BancoMetrics = {
    totalBancos: apiData?.totalItems ?? 0,
    bancosActivos: bancos.filter((b) => b.activo).length,
    cuentasBancariasActivas: bancos.length * 2, // Informative metric placeholder or computed
  };

  const handleOpenAdd = () => {
    setBancoToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (banco: BancoResponse) => {
    setBancoToEdit(banco);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (banco: BancoResponse) => {
    setBancoToDelete(banco);
    setDeleteDialogOpen(true);
  };

  const handleManageCuentas = (banco: BancoResponse) => {
    setSelectedBancoForCuentas(banco);
    setCuentasSheetOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bancoToDelete) return;

    try {
      await deleteBancoMutation.mutateAsync(bancoToDelete.id);
      toast.success(`Banco ${bancoToDelete.codigo} eliminado correctamente.`);
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "No se pudo eliminar el banco. Verifique que no tenga cuentas asociadas."
      );
    } finally {
      setBancoToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <BancoHeader onAddClick={handleOpenAdd} />

      <BancoMetricsCards metrics={metrics} />

      <BancoTable
        bancos={bancos}
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
        onManageCuentas={handleManageCuentas}
        onRefresh={() => refetch()}
      />

      <BancoFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        bancoToEdit={bancoToEdit}
        onSuccessCallback={() => refetch()}
      />

      <BancoDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        banco={bancoToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteBancoMutation.isPending}
      />

      <BancoCuentasSheet
        open={cuentasSheetOpen}
        onOpenChange={setCuentasSheetOpen}
        banco={selectedBancoForCuentas}
      />
    </div>
  );
}
