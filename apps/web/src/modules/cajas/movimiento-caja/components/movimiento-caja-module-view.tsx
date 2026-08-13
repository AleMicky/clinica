"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useDeleteMovimientoCaja,
  useMovimientosCaja,
} from "../hooks/use-movimientos-caja";
import { MovimientoCajaHeader } from "./movimiento-caja-header";
import { MovimientoCajaMetrics } from "./movimiento-caja-metrics";
import { MovimientoCajaTable } from "./movimiento-caja-table";
import { MovimientoCajaFormDialog } from "./movimiento-caja-form-dialog";
import { MovimientoCajaDeleteDialog } from "./movimiento-caja-delete-dialog";
import {
  TipoMovimientoCaja,
  type MovimientoCajaResponse,
} from "../types/movimiento-caja.types";

export function MovimientoCajaModuleView() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [movimientoToEdit, setMovimientoToEdit] =
    React.useState<MovimientoCajaResponse | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [movimientoToDelete, setMovimientoToDelete] =
    React.useState<MovimientoCajaResponse | null>(null);

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
  } = useMovimientosCaja({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteMovimientoCaja();

  const movimientos = apiData?.items ?? [];
  const totalItems = apiData?.totalItems ?? 0;

  const metrics = React.useMemo(() => {
    let ingresos = 0;
    let egresos = 0;

    movimientos.forEach((m) => {
      const monto = Number(m.monto);
      if (
        [
          TipoMovimientoCaja.Ingreso,
          TipoMovimientoCaja.Reposicion,
          TipoMovimientoCaja.AjustePositivo,
        ].includes(m.tipo)
      ) {
        ingresos += monto;
      } else {
        egresos += monto;
      }
    });

    return {
      totalMovimientos: totalItems,
      totalIngresos: ingresos,
      totalEgresos: egresos,
      balanceNeto: ingresos - egresos,
    };
  }, [movimientos, totalItems]);

  const handleOpenCreateModal = () => {
    setMovimientoToEdit(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (mov: MovimientoCajaResponse) => {
    setMovimientoToEdit(mov);
    setFormDialogOpen(true);
  };

  const handlePromptDelete = (mov: MovimientoCajaResponse) => {
    setMovimientoToDelete(mov);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!movimientoToDelete) return;
    try {
      await deleteMutation.mutateAsync(movimientoToDelete.id);
      toast.success("Movimiento de caja eliminado correctamente.");
      setDeleteDialogOpen(false);
      setMovimientoToDelete(null);
      refetch();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Error al eliminar el movimiento de caja."
      );
    }
  };

  return (
    <div className="space-y-4">
      <MovimientoCajaHeader onNewMovimientoClick={handleOpenCreateModal} />

      <MovimientoCajaMetrics metrics={metrics} isLoading={isLoading} />

      <MovimientoCajaTable
        movimientos={movimientos}
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

      <MovimientoCajaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        movimientoToEdit={movimientoToEdit}
        onSuccessCallback={() => refetch()}
      />

      <MovimientoCajaDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        movimiento={movimientoToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
