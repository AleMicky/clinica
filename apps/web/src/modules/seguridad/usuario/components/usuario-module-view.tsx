"use client";

import * as React from "react";
import { toast } from "sonner";
import { UsuarioHeader } from "./usuario-header";
import { UsuarioMetricsCards } from "./usuario-metrics";
import { UsuarioTable } from "./usuario-table";
import { UsuarioFormDialog } from "./usuario-form-dialog";
import { UsuarioDeleteDialog } from "./usuario-delete-dialog";
import { useUsuarios, useDeleteUsuario } from "../hooks/use-usuarios";
import type { UsuarioMetrics, UsuarioResponse } from "../types/usuario.types";

export function UsuarioModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = React.useState<UsuarioResponse | null>(null);

  // Delete AlertDialog confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = React.useState<UsuarioResponse | null>(null);

  // Pagination & search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  // React Query Hook: Requests real API endpoint `/usuarios`
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useUsuarios({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const deleteMutation = useDeleteUsuario();

  // Reset pagination when search or page size changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const usuarios: UsuarioResponse[] = apiData?.items ?? [];

  // Compute Metrics from API data
  const total = apiData?.totalItems ?? usuarios.length;
  const activas = usuarios.filter((u) => u.activo).length;
  const bloqueadas = usuarios.filter((u) => !u.activo).length;
  const cobertura = total > 0 ? Math.round((activas / total) * 100) : 100;

  const metrics: UsuarioMetrics = {
    totalUsuarios: total,
    cuentasActivas: activas,
    cuentasBloqueadas: bloqueadas,
    coberturaSeguridad: cobertura,
  };

  const handleOpenAdd = () => {
    setUsuarioToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (usuario: UsuarioResponse) => {
    setUsuarioToEdit(usuario);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (id: number) => {
    const target = usuarios.find((u) => u.id === id);
    if (target) {
      setUsuarioToDelete(target);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!usuarioToDelete) return;

    try {
      await deleteMutation.mutateAsync(usuarioToDelete.id);
      toast.success(
        `Usuario @${usuarioToDelete.userName} eliminado correctamente.`
      );
      refetch();
    } catch {
    } finally {
      setUsuarioToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <UsuarioHeader onAddClick={handleOpenAdd} />
      <UsuarioMetricsCards metrics={metrics} />
      <UsuarioTable
        usuarios={usuarios}
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
      <UsuarioFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        usuarioToEdit={usuarioToEdit}
        onSuccessCallback={() => refetch()}
      />
      <UsuarioDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        usuario={usuarioToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
