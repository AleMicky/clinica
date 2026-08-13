"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useArqueosCaja,
  useDeleteArqueoCaja,
} from "../hooks/use-arqueos-caja";
import { ArqueoCajaHeader } from "./arqueo-caja-header";
import { ArqueoCajaMetrics } from "./arqueo-caja-metrics";
import { ArqueoCajaTable } from "./arqueo-caja-table";
import { ArqueoCajaFormDialog } from "./arqueo-caja-form-dialog";
import { ArqueoCajaDeleteDialog } from "./arqueo-caja-delete-dialog";
import type { ArqueoCajaResponse } from "../types/arqueo-caja.types";

export function ArqueoCajaModuleView() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [arqueoToEdit, setArqueoToEdit] =
    React.useState<ArqueoCajaResponse | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [arqueoToDelete, setArqueoToDelete] =
    React.useState<ArqueoCajaResponse | null>(null);

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
  } = useArqueosCaja({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteArqueoCaja();

  const arqueos = apiData?.items ?? [];
  const totalItems = apiData?.totalItems ?? 0;

  const metrics = React.useMemo(() => {
    let exactos = 0;
    let diferencias = 0;

    arqueos.forEach((a) => {
      if (Math.abs(Number(a.diferencia)) < 0.01) {
        exactos++;
      } else {
        diferencias++;
      }
    });

    return {
      totalArqueos: totalItems,
      totalConCuadreExacto: exactos,
      totalConDiferencia: diferencias,
    };
  }, [arqueos, totalItems]);

  const handleOpenCreateModal = () => {
    setArqueoToEdit(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (arq: ArqueoCajaResponse) => {
    setArqueoToEdit(arq);
    setFormDialogOpen(true);
  };

  const handlePromptDelete = (arq: ArqueoCajaResponse) => {
    setArqueoToDelete(arq);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!arqueoToDelete) return;
    try {
      await deleteMutation.mutateAsync(arqueoToDelete.id);
      toast.success("Arqueo de caja eliminado correctamente.");
      setDeleteDialogOpen(false);
      setArqueoToDelete(null);
      refetch();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Error al eliminar el arqueo de caja."
      );
    }
  };

  return (
    <div className="space-y-4">
      <ArqueoCajaHeader onNewArqueoClick={handleOpenCreateModal} />

      <ArqueoCajaMetrics metrics={metrics} isLoading={isLoading} />

      <ArqueoCajaTable
        arqueos={arqueos}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onEdit={handleEdit}
        onDelete={handlePromptDelete}
        onRefresh={() => refetch()}
      />

      <ArqueoCajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        arqueoToEdit={arqueoToEdit}
        onSuccessCallback={() => refetch()}
      />

      <ArqueoCajaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        arqueo={arqueoToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
