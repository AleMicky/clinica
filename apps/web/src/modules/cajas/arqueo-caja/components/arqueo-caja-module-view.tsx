"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useArqueosCaja,
  useDeleteArqueoCaja,
} from "../hooks/use-arqueos-caja";
import { ArqueoCajaHeader } from "./arqueo-caja-header";
import { ArqueoCajaMetrics } from "./arqueo-caja-metrics";
import { ArqueoCajaList } from "./arqueo-caja-list";
import { ArqueoCajaFormDialog } from "./arqueo-caja-form-dialog";
import { ArqueoCajaDeleteDialog } from "./arqueo-caja-delete-dialog";
import type { ArqueoCajaResponse } from "../types/arqueo-caja.types";

export function ArqueoCajaModuleView() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<
    "TODOS" | "CUADRADOS" | "DIFERENCIA"
  >("TODOS");

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

  const allArqueos = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
    ? (apiData as unknown as ArqueoCajaResponse[])
    : [];
  const totalItems = apiData?.totalItems ?? allArqueos.length;

  // Filtrado local por pestañas
  const filteredArqueos = React.useMemo(() => {
    if (selectedFilter === "CUADRADOS") {
      return allArqueos.filter((a) => Math.abs(Number(a.diferencia)) < 0.001);
    }
    if (selectedFilter === "DIFERENCIA") {
      return allArqueos.filter((a) => Math.abs(Number(a.diferencia)) >= 0.001);
    }
    return allArqueos;
  }, [allArqueos, selectedFilter]);

  const metrics = React.useMemo(() => {
    let exactos = 0;
    let diferencias = 0;

    allArqueos.forEach((a) => {
      if (Math.abs(Number(a.diferencia)) < 0.001) {
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
  }, [allArqueos, totalItems]);

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
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      <ArqueoCajaHeader
        onNewArqueoClick={handleOpenCreateModal}
        onRefresh={() => refetch()}
      />

      <ArqueoCajaMetrics
        metrics={metrics}
        selectedFilter={selectedFilter}
        onFilterChange={(f) => {
          setSelectedFilter(f);
          setCurrentPage(1);
        }}
      />

      <ArqueoCajaList
        arqueos={filteredArqueos}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedFilter={selectedFilter}
        onFilterChange={(f) => {
          setSelectedFilter(f);
          setCurrentPage(1);
        }}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onEdit={handleEdit}
        onDelete={handlePromptDelete}
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
